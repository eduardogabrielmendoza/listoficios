"use client";

import Image from "next/image";
import { useState } from "react";
import type { PortfolioItem } from "@/lib/api-contracts";

export function PublicGallery({ items }: { items: PortfolioItem[] }) {
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  if (!items.length) return <div className="profile-gallery mt-5 grid h-[230px] place-items-center rounded-[24px] sm:h-[320px]"><span className="rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-[var(--muted)]">Este profesional todavía no agregó trabajos</span></div>;

  return <>
    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3">
      {items.map((item, index) => <button key={item.id} type="button" onClick={() => setSelected(item)} className={`relative overflow-hidden rounded-[18px] bg-[var(--paper)] sm:rounded-[22px] ${index === 0 && items.length > 2 ? "col-span-2 aspect-[16/8]" : "aspect-[4/3]"}`} aria-label={`Ampliar ${item.alt || item.caption || "trabajo"}`}>
        <Image src={item.url} alt={item.alt} fill sizes={index === 0 ? "(max-width: 1024px) 100vw, 720px" : "(max-width: 640px) 50vw, 360px"} className="object-cover transition duration-300 hover:scale-[1.025]" style={{ objectPosition: `${item.focalX * 100}% ${item.focalY * 100}%` }} />
        {item.caption && <span className="absolute inset-x-2 bottom-2 line-clamp-1 rounded-xl bg-[rgba(8,35,30,.72)] px-3 py-2 text-left text-[11px] font-medium text-white backdrop-blur sm:inset-x-3 sm:bottom-3 sm:text-xs">{item.caption}</span>}
      </button>)}
    </div>
    {selected && <div className="fixed inset-0 z-[110] grid place-items-center bg-[rgba(5,22,19,.86)] p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Trabajo ampliado"><button className="absolute inset-0" onClick={() => setSelected(null)} aria-label="Cerrar vista ampliada"/><div className="relative h-[78vh] w-full max-w-6xl overflow-hidden rounded-[22px] bg-[#071c18]"><Image src={selected.url.replace("variant=gallery", "variant=full")} alt={selected.alt} fill sizes="100vw" className="object-contain" /><button onClick={() => setSelected(null)} className="absolute right-3 top-3 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-lg">Cerrar</button>{selected.caption && <p className="absolute inset-x-3 bottom-3 rounded-2xl bg-white/95 p-3 text-sm text-[var(--ink)] sm:inset-x-5 sm:bottom-5">{selected.caption}</p>}</div></div>}
  </>;
}
