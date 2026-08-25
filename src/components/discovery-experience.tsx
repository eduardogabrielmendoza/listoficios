"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AmbientGlow } from "@/components/ambient-glow";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { ProfessionalCard } from "@/components/professional-card";
import { useSiteConfig } from "@/components/site-config-provider";
import type { ServiceProfile } from "@/lib/app-types";
import type { Category } from "@/lib/mock-data";
import { BELLA_VISTA_ZONES } from "@/lib/profile-defaults";

export function DiscoveryExperience({ categories, initialProfessionals: seededProfessionals }: { categories: Category[]; initialProfessionals: ServiceProfile[] }) {
  const router = useRouter(); const site = useSiteConfig();
  const [q, setQ] = useState(""); const [zone, setZone] = useState(""); const [professionals, setProfessionals] = useState(seededProfessionals);
  const featured = site.home.featuredProfileSlug ? professionals.find((item) => item.slug === site.home.featuredProfileSlug) ?? professionals[0] : professionals[0];

  useEffect(() => { const controller = new AbortController(); void fetch("/api/v1/professionals?limit=3", { signal: controller.signal }).then((response) => response.ok ? response.json() : null).then((payload) => { if (payload?.data?.length) setProfessionals(payload.data); }).catch(() => undefined); return () => controller.abort(); }, []);
  function submit(event: FormEvent) { event.preventDefault(); const params = new URLSearchParams(); if (q.trim()) params.set("q", q.trim()); if (zone) params.set("zone", zone); router.push(`/profesionales?${params}`); }

  return <>
    <section className="relative isolate overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-14">
      <div className="hero-grid absolute inset-0 -z-20"/><AmbientGlow/>
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
        <div className="max-w-[700px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe1da] bg-white/80 px-3.5 py-2 text-xs font-medium text-[var(--brand)] shadow-sm"><span className="size-2 rounded-full bg-[var(--accent)]"/>{site.home.eyebrow}</div>
          <h1 className="mt-6 text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[.94] tracking-[-.06em] text-[var(--ink)] sm:mt-7">{site.home.title} <span className="text-[var(--brand)]">{site.home.highlight}</span></h1>
          <p className="mt-5 max-w-[590px] text-base leading-7 text-[#52635d] sm:mt-7 sm:text-xl sm:leading-8">{site.home.description}</p>
          <form onSubmit={submit} className="mt-7 grid gap-2 rounded-[22px] border border-[#d4e0dc] bg-white p-2 shadow-[0_24px_65px_rgba(26,72,61,.13)] sm:mt-9 sm:rounded-[24px] md:grid-cols-[1fr_210px_auto]">
            <label className="flex min-w-0 items-center gap-3 px-3 py-3 sm:px-4"><Icon name="search" className="size-5 shrink-0 text-[var(--brand)]"/><span className="sr-only">Servicio</span><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Ej. plomero, pintar una habitación…" className="min-w-0 flex-1 bg-transparent text-sm outline-none"/></label>
            <label className="flex min-w-0 items-center gap-2 border-y border-[var(--line)] px-3 py-3 sm:px-4 md:border-x md:border-y-0"><Icon name="location" className="size-5 shrink-0 text-[var(--brand)]"/><span className="sr-only">Zona de Bella Vista</span><select value={zone} onChange={(event) => setZone(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none"><option value="">Toda Bella Vista</option>{BELLA_VISTA_ZONES.map((item) => <option key={item}>{item}</option>)}</select></label>
            <button className="primary-button !h-12">Buscar</button>
          </form>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#64736e]"><span><Icon name="check" className="mr-1 inline size-4 text-[var(--brand)]"/>Buscar es gratis</span><span><Icon name="check" className="mr-1 inline size-4 text-[var(--brand)]"/>Sin cuenta</span><span><Icon name="message" className="mr-1 inline size-4 text-[var(--brand)]"/>Contacto directo</span></div>
          {featured ? <Link href={`/profesionales/${featured.slug}`} className="mt-7 flex items-center gap-3 rounded-[22px] border border-[#d4e0dc] bg-white/90 p-3.5 shadow-lg lg:hidden"><Avatar initials={featured.initials} tone={featured.avatarTone} imageUrl={featured.avatarUrl} className="size-14"/><div className="min-w-0 flex-1"><p className="truncate font-semibold">{featured.name}</p><p className="truncate text-xs text-[var(--muted)]">{featured.trade} · Bella Vista</p><p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[var(--brand)]"><Icon name="message" className="size-3.5"/> Contacto por WhatsApp</p></div><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent)]"><Icon name="arrow-right" className="size-4"/></span></Link> : null}
        </div>
        {featured ? <div className="relative mx-auto hidden w-full max-w-[440px] lg:block"><div className="relative rounded-[38px] bg-[var(--ink)] p-7 text-white shadow-[0_35px_90px_rgba(19,55,47,.22)]"><div className="absolute right-8 top-8 size-28 rounded-full bg-[var(--accent)] opacity-80 blur-3xl"/><div className="relative"><div className="flex items-center gap-4"><Avatar initials={featured.initials} tone={featured.avatarTone} imageUrl={featured.avatarUrl} className="size-16"/><div className="min-w-0"><p className="truncate text-xl font-semibold">{featured.name}</p><p className="truncate text-sm text-white/60">{featured.trade} · Bella Vista</p></div></div><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-4"><Icon name="message" className="size-5 text-[var(--accent)]"/><p className="mt-3 text-sm font-semibold">Responde por WhatsApp</p></div><div className="rounded-2xl bg-white/10 p-4"><Icon name="check" className="size-5 text-[var(--accent)]"/><p className="mt-3 text-sm font-semibold">Servicio disponible</p></div></div><div className="mt-5 rounded-2xl bg-white p-5 text-[var(--ink)]"><p className="text-xs font-medium text-[var(--muted)]">Servicio publicado</p><p className="mt-1 line-clamp-2 font-semibold">{featured.skills[0] || featured.trade}</p><div className="mt-4 flex items-center justify-between"><span className="text-xs text-[var(--muted)]">Ver perfil completo</span><span className="grid size-10 place-items-center rounded-full bg-[var(--accent)]"><Icon name="arrow-right" className="size-4"/></span></div></div></div></div></div> : null}
      </div>
    </section>
    <section className="border-t border-[var(--line)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"><div className="mx-auto max-w-[1180px]"><div className="flex items-end justify-between gap-4"><div><p className="section-kicker">Explorá por oficio</p><h2 className="section-title mt-3">¿Qué necesitás resolver?</h2></div><Link href="/profesionales" className="hidden items-center gap-2 text-sm font-semibold text-[var(--brand)] sm:flex">Ver todos <Icon name="arrow-right" className="size-4"/></Link></div><div className="mt-7 grid grid-cols-2 gap-3 sm:mt-9 md:grid-cols-4">{categories.map((category) => <Link key={category.id} href={`/profesionales?category=${category.id}`} className="rounded-[18px] border border-[var(--line)] bg-white p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[#b9cec7] hover:shadow-[0_12px_30px_rgba(9,48,40,.06)] sm:p-5"><span className="grid size-11 place-items-center rounded-[13px] bg-[#edf4f1] text-[var(--brand)]"><Icon name={category.icon} className="size-5"/></span><span className="mt-4 block font-semibold">{category.name}</span><span className="mt-1 hidden text-xs leading-5 text-[var(--muted)] sm:block">{category.description}</span></Link>)}</div></div></section>
    <section id="profesionales" className="scroll-mt-24 bg-[var(--paper)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"><div className="mx-auto max-w-[1180px]"><div className="flex items-end justify-between gap-4"><div><p className="section-kicker">Perfiles para conocer</p><h2 className="section-title mt-3">Servicios cerca tuyo</h2><p className="section-copy mt-4">Información simple para comparar antes de hablar.</p></div><Link href="/profesionales" className="hidden secondary-button sm:inline-flex">Ver todos</Link></div><div className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 lg:grid-cols-3">{professionals.slice(0, 3).map((profile) => <ProfessionalCard key={profile.id} professional={profile}/>)}</div><Link href="/profesionales" className="primary-button mt-7 w-full sm:hidden">Ver todos los profesionales</Link></div></section>
  </>;
}
