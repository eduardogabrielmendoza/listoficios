import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfessionalCard } from "@/components/professional-card";
import { Icon } from "@/components/icons";
import { listProfessionals } from "@/data/professionals";
import { BELLA_VISTA_ZONES } from "@/lib/profile-defaults";
import { createSlug } from "@/lib/slug";

export const dynamic="force-dynamic";
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const slug=(await params).slug;const zone=BELLA_VISTA_ZONES.find((item)=>createSlug(item)===slug);return zone?{title:`Profesionales en ${zone} | Listoficios`,description:`Servicios y profesionales con cobertura en ${zone}, Bella Vista.`,alternates:{canonical:`/zonas/${slug}`}}:{}}
export default async function ZonePage({params}:{params:Promise<{slug:string}>}){const slug=(await params).slug;const zone=BELLA_VISTA_ZONES.find((item)=>createSlug(item)===slug);if(!zone)notFound();const result=await listProfessionals({zone,limit:30});return <main><section className="border-b border-[var(--line)] bg-[var(--paper)] px-4 py-12 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1100px]"><Link href="/zonas" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]"><Icon name="arrow-left" className="size-4"/> Todas las zonas</Link><p className="section-kicker mt-8">Bella Vista</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Profesionales en {zone}</h1><p className="mt-4 text-[var(--muted)]">Publicaciones que indican cobertura en esta zona.</p></div></section><section className="px-4 py-12 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1100px]">{result.data.length?<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{result.data.map((professional)=><ProfessionalCard key={professional.id} professional={professional}/>)}</div>:<div className="rounded-[26px] border border-dashed border-[var(--line)] p-12 text-center"><h2 className="text-xl font-semibold">Todavía no hay cobertura publicada</h2><Link href="/profesionales" className="secondary-button mt-5">Ver todo Bella Vista</Link></div>}</div></section></main>}
