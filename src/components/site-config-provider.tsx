"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultSiteConfig, type SiteConfig } from "@/lib/site-config";

const SiteConfigContext = createContext<SiteConfig>(defaultSiteConfig);

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(defaultSiteConfig);
  useEffect(() => { const controller = new AbortController(); void fetch("/api/v1/site-config", { signal: controller.signal }).then((response) => response.ok ? response.json() : null).then((payload) => { if (payload?.data) setConfig(payload.data); }).catch(() => undefined); return () => controller.abort(); }, []);
  useEffect(() => { const root = document.documentElement; root.style.setProperty("--brand", config.theme.brand); root.style.setProperty("--ink", config.theme.ink); root.style.setProperty("--accent", config.theme.accent); root.style.setProperty("--lime", config.theme.accent); }, [config]);
  const value = useMemo(() => config, [config]);
  return <SiteConfigContext.Provider value={value}>{config.announcement.enabled && config.announcement.text ? <a href={config.announcement.href || "#"} className="block bg-[var(--ink)] px-4 py-2 text-center text-xs font-medium text-white">{config.announcement.text}</a> : null}{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() { return useContext(SiteConfigContext); }
