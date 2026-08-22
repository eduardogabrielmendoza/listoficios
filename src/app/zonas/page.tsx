import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Icon } from "@/components/icons";
import { BELLA_VISTA_ZONES } from "@/lib/profile-defaults";
import { createSlug } from "@/lib/slug";

export const metadata:Metadata={title:"Zonas de Bella Vista | Listoficios",description:"Encontrá profesionales que trabajan en tu zona de Bella Vista."};
export default function ZonesPage(){return <main><PageHero kicker="Cerca tuyo" title="Buscá profesionales por zona." copy="Bella Vista es nuestra ciudad inicial. Elegí tu barrio o consultá también la cobertura de alrededores." icon="location"/><section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20"><div className="mx-auto grid max-w-[1000px] gap-4 sm:grid-cols-2 lg:grid-cols-3">{BELLA_VISTA_ZONES.map((zone)=><Link key={zone} href={`/zonas/${createSlug(zone)}`} className="flex items-center gap-4 rounded-[24px] border border-[var(--line)] bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"><span className="grid size-11 place-items-center rounded-2xl bg-[#eaf4f0] text-[var(--brand)]"><Icon name="location" className="size-5"/></span><div><h2 className="font-semibold">{zone}</h2><p className="mt-1 text-xs text-[var(--muted)]">Ver cobertura disponible</p></div><Icon name="chevron-right" className="ml-auto size-4"/></Link>)}</div></section></main>}
