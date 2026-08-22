import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { Icon } from "@/components/icons";
import { categories } from "@/lib/mock-data";

export const metadata:Metadata={title:"Servicios en Bella Vista | Listoficios",description:"Explorá oficios y servicios disponibles en Bella Vista, Tucumán."};
export default function ServicesPage(){return <main><PageHero kicker="Catálogo local" title="Servicios para resolver lo que necesitás." copy="Explorá por tipo de oficio y compará profesionales de Bella Vista sin crear una cuenta." icon="hammer"/><section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20"><div className="mx-auto grid max-w-[1180px] gap-4 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category)=><Link key={category.id} href={`/servicios/${category.id}`} className="group rounded-[26px] border border-[var(--line)] bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"><span className="grid size-12 place-items-center rounded-2xl bg-[#eaf4f0] text-[var(--brand)]"><Icon name={category.icon} className="size-6"/></span><h2 className="mt-5 text-xl font-semibold">{category.name}</h2><p className="mt-2 min-h-10 text-sm leading-5 text-[var(--muted)]">{category.description}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">Ver profesionales <Icon name="arrow-right" className="size-4"/></span></Link>)}</div></section></main>}
