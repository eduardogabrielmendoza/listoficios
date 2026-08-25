"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteConfig } from "@/components/site-config-provider";

export function Brand({ compact = false }: { compact?: boolean }) {
  const config = useSiteConfig(); const assetId = compact ? config.brand.compactLogoAssetId : config.brand.logoAssetId;
  return <Link href="/" className="group inline-flex items-center gap-2.5" aria-label={`${config.brand.name}, inicio`}>
    {assetId ? <Image src={`/site-assets/${assetId}`} alt={config.brand.name} width={compact ? 40 : 150} height={40} className={compact ? "size-10 object-contain" : "h-10 w-auto max-w-[170px] object-contain"}/> : <><span className="relative grid size-9 place-items-center overflow-hidden rounded-[11px] bg-[var(--ink)] text-white shadow-lg"><span className="absolute -right-1 -top-1 size-4 rounded-full bg-[var(--lime)]"/><svg viewBox="0 0 24 24" className="relative size-[21px]" fill="none" aria-hidden="true"><path d="M7 5.5v9.25c0 1.25 1 2.25 2.25 2.25H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="m11.5 12.4 2.15 2.15L18 10.2" stroke="var(--lime)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>{!compact ? <span className="text-[1.32rem] font-semibold tracking-[-.045em] text-[var(--ink)]">{config.brand.name}</span> : null}</>}
  </Link>;
}
