"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useSiteConfig } from "@/components/site-config-provider";
import { selectHomeMotionMode, type HomeMotionMode } from "@/lib/home-motion";

const HomeMotionController = dynamic(() => import("@/components/home-motion-controller"), { ssr: false });

type NavigatorWithConnection = Navigator & { connection?: { saveData?: boolean } };

export function HomeMotionLoader() {
  const site = useSiteConfig();
  const [mode, setMode] = useState<HomeMotionMode>("off");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const update = () => setMode(selectHomeMotionMode({
      enabled: site.motion.enabled,
      reducedMotion: reduced.matches,
      saveData: Boolean((navigator as NavigatorWithConnection).connection?.saveData),
      desktop: desktop.matches,
    }));
    update();
    reduced.addEventListener("change", update);
    desktop.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
    };
  }, [site.motion.enabled]);

  return mode === "off" ? null : <HomeMotionController mode={mode} />;
}
