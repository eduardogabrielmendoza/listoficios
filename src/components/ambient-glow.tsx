"use client";
import { useEffect, useRef } from "react";
export function AmbientGlow({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const glow = ref.current;
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!glow || !query.matches) return;
    let timer = 0;
    const move = () => { glow.style.setProperty("--glow-shift-x", `${-16 + Math.random() * 32}%`); glow.style.setProperty("--glow-shift-y", `${-10 + Math.random() * 22}%`); timer = window.setTimeout(move, 4000 + Math.random() * 3000); };
    timer = window.setTimeout(move, 800);
    return () => window.clearTimeout(timer);
  }, []);
  return <div ref={ref} className={`ambient-glow pointer-events-none absolute inset-0 -z-10 ${className}`} aria-hidden="true" />;
}
