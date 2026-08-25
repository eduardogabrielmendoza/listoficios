"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AmbientGlow } from "@/components/ambient-glow";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { useSiteConfig } from "@/components/site-config-provider";
import type { ServiceProfile } from "@/lib/app-types";
import type { Category } from "@/lib/mock-data";
import { BELLA_VISTA_ZONES } from "@/lib/profile-defaults";

export function DiscoveryExperience({ categories, initialProfessionals }: { categories: Category[]; initialProfessionals: ServiceProfile[] }) {
  const router = useRouter();
  const site = useSiteConfig();
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState("");
  const featured = site.home.featuredProfileSlug
    ? initialProfessionals.find((item) => item.slug === site.home.featuredProfileSlug) ?? initialProfessionals[0]
    : initialProfessionals[0];

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (zone) params.set("zone", zone);
    router.push(`/profesionales?${params.toString()}`);
  }

  return (
    <>
      <section data-motion-hero className="relative isolate overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:min-h-[760px] lg:px-8 lg:pb-24 lg:pt-14">
        <div className="hero-grid absolute inset-0 -z-20" /><AmbientGlow />
        <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
          <div className="max-w-[700px]" data-motion-hero-copy-group>
            <div className="motion-mask inline-flex"><span data-motion-hero-eyebrow className="inline-flex items-center gap-2 rounded-full border border-[#cfe1da] bg-white/80 px-3.5 py-2 text-xs font-medium text-[var(--brand)] shadow-sm"><span className="size-2 rounded-full bg-[var(--accent)]" />{site.home.eyebrow}</span></div>
            <h1 className="mt-6 text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[.94] tracking-[-.06em] text-[var(--ink)] sm:mt-7">
              <span className="motion-mask block"><span data-motion-title-line className="block">{site.home.title}</span></span>
              <span className="motion-mask block"><span data-motion-title-line data-motion-highlight className="motion-highlight block text-[var(--brand)]">{site.home.highlight}</span></span>
            </h1>
            <p data-motion-hero-copy className="mt-5 max-w-[590px] text-base leading-7 text-[#52635d] sm:mt-7 sm:text-xl sm:leading-8">{site.home.description}</p>
            <form data-motion-search onSubmit={submit} className="mt-7 grid gap-2 rounded-[22px] border border-[#d4e0dc] bg-white p-2 shadow-[0_24px_65px_rgba(26,72,61,.13)] sm:mt-9 sm:rounded-[24px] md:grid-cols-[1fr_210px_auto]">
              <label className="flex min-w-0 items-center gap-3 px-3 py-3 sm:px-4"><Icon name="search" className="size-5 shrink-0 text-[var(--brand)]" /><span className="sr-only">Servicio</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. plomero, pintar una habitación…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
              <label className="flex min-w-0 items-center gap-2 border-y border-[var(--line)] px-3 py-3 sm:px-4 md:border-x md:border-y-0"><Icon name="location" className="size-5 shrink-0 text-[var(--brand)]" /><span className="sr-only">Zona de Bella Vista</span><select value={zone} onChange={(event) => setZone(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"><option value="">Toda Bella Vista</option>{BELLA_VISTA_ZONES.map((item) => <option key={item}>{item}</option>)}</select></label>
              <button className="primary-button !h-12">Buscar</button>
            </form>
            <div data-motion-hero-copy className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#64736e]"><span><Icon name="check" className="mr-1 inline size-4 text-[var(--brand)]" />Buscar es gratis</span><span><Icon name="check" className="mr-1 inline size-4 text-[var(--brand)]" />Sin cuenta</span><span><Icon name="message" className="mr-1 inline size-4 text-[var(--brand)]" />Contacto directo</span></div>
            {featured ? <Link data-motion-hero-card href={`/profesionales/${featured.slug}`} className="mt-7 flex items-center gap-3 rounded-[22px] border border-[#d4e0dc] bg-white/90 p-3.5 shadow-lg lg:hidden"><Avatar initials={featured.initials} tone={featured.avatarTone} imageUrl={featured.avatarUrl} className="size-14" /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{featured.name}</p><p className="truncate text-xs text-[var(--muted)]">{featured.trade} · Bella Vista</p><p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[var(--brand)]"><Icon name="message" className="size-3.5" /> Contacto por WhatsApp</p></div><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent)]"><Icon name="arrow-right" className="size-4" /></span></Link> : null}
          </div>
          {featured ? <div data-motion-hero-card className="relative mx-auto hidden w-full max-w-[440px] lg:block"><div className="relative rounded-[38px] bg-[var(--ink)] p-7 text-white shadow-[0_35px_90px_rgba(19,55,47,.22)]"><div className="absolute right-8 top-8 size-28 rounded-full bg-[var(--accent)] opacity-80 blur-3xl" /><div className="relative"><div className="flex items-center gap-4"><Avatar initials={featured.initials} tone={featured.avatarTone} imageUrl={featured.avatarUrl} className="size-16" /><div className="min-w-0"><p className="truncate text-xl font-semibold">{featured.name}</p><p className="truncate text-sm text-white/60">{featured.trade} · Bella Vista</p></div></div><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-4"><Icon name="message" className="size-5 text-[var(--accent)]" /><p className="mt-3 text-sm font-semibold">Responde por WhatsApp</p></div><div className="rounded-2xl bg-white/10 p-4"><Icon name="check" className="size-5 text-[var(--accent)]" /><p className="mt-3 text-sm font-semibold">Servicio disponible</p></div></div><Link href={`/profesionales/${featured.slug}`} className="mt-5 block rounded-2xl bg-white p-5 text-[var(--ink)]"><p className="text-xs font-medium text-[var(--muted)]">Servicio publicado</p><p className="mt-1 line-clamp-2 font-semibold">{featured.skills[0] || featured.trade}</p><span className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">Ver perfil completo <span className="grid size-10 place-items-center rounded-full bg-[var(--accent)] text-[var(--ink)]"><Icon name="arrow-right" className="size-4" /></span></span></Link></div></div></div> : null}
        </div>
      </section>

      <section data-motion-categories className="border-t border-[var(--line)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex items-end justify-between gap-4"><div><p className="section-kicker">Explorá por oficio</p><h2 className="section-title mt-3">¿Qué necesitás resolver?</h2></div><Link href="/profesionales" className="hidden items-center gap-2 text-sm font-semibold text-[var(--brand)] sm:flex">Ver todos <Icon name="arrow-right" className="size-4" /></Link></div>
          <div data-motion-category-rule className="mt-8 h-px bg-[var(--line)]" />
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{categories.map((category) => <Link data-motion-category-card key={category.id} href={`/profesionales?category=${category.id}`} className="category-editorial-card"><span className="category-editorial-icon"><Icon name={category.icon} className="size-5" /></span><span className="motion-mask mt-4 block"><span className="block font-semibold">{category.name}</span></span><span className="mt-1 hidden text-xs leading-5 text-[var(--muted)] sm:block">{category.description}</span></Link>)}</div>
        </div>
      </section>
    </>
  );
}
