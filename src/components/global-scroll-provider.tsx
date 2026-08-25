"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSiteConfig } from "@/components/site-config-provider";
import { selectGlobalScrollMode, type GlobalScrollMode } from "@/lib/global-scroll";

export type { GlobalScrollMode } from "@/lib/global-scroll";

type GlobalScrollContextValue = {
  lenis: Lenis | null;
  mode: GlobalScrollMode;
  acquireExternalFrame: () => () => void;
  lock: () => () => void;
};

const GlobalScrollContext = createContext<GlobalScrollContextValue>({
  lenis: null,
  mode: "native",
  acquireExternalFrame: () => () => undefined,
  lock: () => () => undefined,
});

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

export function GlobalScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const site = useSiteConfig();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [mode, setMode] = useState<GlobalScrollMode>("native");
  const [capabilityVersion, setCapabilityVersion] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const externalFramesRef = useRef(0);
  const locksRef = useRef(0);
  const bodyOverflowRef = useRef("");

  const startNativeFrame = useCallback(() => {
    if (!lenisRef.current || externalFramesRef.current > 0 || rafRef.current !== null) return;
    const frame = (time: number) => {
      lenisRef.current?.raf(time);
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
  }, []);

  const acquireExternalFrame = useCallback(() => {
    externalFramesRef.current += 1;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      externalFramesRef.current = Math.max(0, externalFramesRef.current - 1);
      startNativeFrame();
    };
  }, [startNativeFrame]);

  const lock = useCallback(() => {
    if (locksRef.current === 0) {
      bodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    locksRef.current += 1;
    lenisRef.current?.stop();
    document.documentElement.dataset.scrollLocked = "true";
    let released = false;
    return () => {
      if (released) return;
      released = true;
      locksRef.current = Math.max(0, locksRef.current - 1);
      if (locksRef.current === 0) {
        document.body.style.overflow = bodyOverflowRef.current;
        delete document.documentElement.dataset.scrollLocked;
        if (!document.hidden) lenisRef.current?.start();
      }
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)");
    const refreshCapabilities = () => setCapabilityVersion((current) => current + 1);
    reduced.addEventListener("change", refreshCapabilities);
    desktop.addEventListener("change", refreshCapabilities);
    return () => {
      reduced.removeEventListener("change", refreshCapabilities);
      desktop.removeEventListener("change", refreshCapabilities);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(hover: hover) and (pointer: fine)");
    const saveData = Boolean((navigator as NavigatorWithConnection).connection?.saveData);
    const nextMode = selectGlobalScrollMode({ enabled: site.motion.smoothScrollEnabled, reducedMotion: reduced.matches, saveData, finePointer: desktop.matches });
    document.documentElement.dataset.globalScroll = nextMode;
    let stateTimer: number | undefined;
    const publishState = (nextLenis: Lenis | null) => {
      stateTimer = window.setTimeout(() => { setMode(nextMode); setLenis(nextLenis); }, 0);
    };

    if (nextMode !== "smooth") {
      lenisRef.current = null;
      publishState(null);
      return () => { if (stateTimer) window.clearTimeout(stateTimer); delete document.documentElement.dataset.globalScroll; };
    }

    const instance = new Lenis({
      autoRaf: false,
      lerp: 0.105,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 0.92,
      anchors: { offset: -84 },
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
      prevent: (node) => Boolean(node.closest("[data-scroll-native], [role='dialog'], input, textarea, select, [contenteditable='true']")),
    });
    lenisRef.current = instance;
    publishState(instance);
    startNativeFrame();

    const onVisibility = () => {
      if (document.hidden) instance.stop();
      else if (locksRef.current === 0) instance.start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (stateTimer) window.clearTimeout(stateTimer);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
      delete document.documentElement.dataset.globalScroll;
    };
  }, [site.motion.smoothScrollEnabled, startNativeFrame, capabilityVersion]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      lenisRef.current?.resize();
      if (window.location.hash) lenisRef.current?.scrollTo(window.location.hash, { offset: -84 });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!lenis) return;
    let frame: number | null = null;
    const resize = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => lenis.resize());
    };
    const observer = new ResizeObserver(resize);
    observer.observe(document.body);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [lenis]);

  const value = useMemo(() => ({ lenis, mode, acquireExternalFrame, lock }), [lenis, mode, acquireExternalFrame, lock]);
  return <GlobalScrollContext.Provider value={value}>{children}</GlobalScrollContext.Provider>;
}

export function useGlobalScroll() {
  return useContext(GlobalScrollContext);
}

export function useScrollLock(active: boolean) {
  const { lock } = useGlobalScroll();
  useEffect(() => active ? lock() : undefined, [active, lock]);
}
