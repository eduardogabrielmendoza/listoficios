import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { ProfileActions } from "@/components/profile-actions";
import { ProfileViewTracker } from "@/components/profile-view-tracker";
import { PublicGallery } from "@/components/public-gallery";
import { getProfessionalBySlug, getPublicProfile } from "@/data/professionals";
import { formatPrice } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const profile = await getPublicProfile((await params).slug);
  return profile ? {
    title: `${profile.displayName} · ${profile.headline} | Listoficios`,
    description: profile.bio,
    alternates: { canonical: `/profesionales/${profile.slug}` },
    openGraph: { title: `${profile.displayName} · ${profile.headline}`, description: profile.bio, type: "profile", images: profile.cover ? [profile.cover.url.replace("variant=cover", "variant=full")] : undefined },
  } : {};
}

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const [profile, card] = await Promise.all([getPublicProfile(slug), getProfessionalBySlug(slug)]);
  if (!profile || !card) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: profile.displayName,
    description: profile.bio,
    areaServed: profile.zones.map((name) => ({ "@type": "Place", name })),
    url: `${process.env.APP_URL ?? "http://localhost:3000"}/profesionales/${profile.slug}`,
  };

  return <main className="pb-24 lg:pb-0">
    <ProfileViewTracker profileId={profile.id}/>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}/>

    <section className="border-b border-[var(--line)] bg-[var(--paper)] px-4 pb-9 pt-6 sm:px-6 sm:pb-10 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <Link href="/profesionales" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--brand)]"><Icon name="arrow-left" className="size-4"/> Volver al directorio</Link>
        <div className="relative mt-5 h-[180px] w-full overflow-hidden rounded-[24px] bg-[#c9dfd6] sm:mt-7 sm:h-auto sm:aspect-[3/1] sm:rounded-[30px]">
          {profile.cover ? <Image src={profile.cover.url} alt={profile.cover.alt} fill priority sizes="(max-width: 1200px) 100vw, 1100px" className="object-cover" style={{ objectPosition: `${profile.cover.focalX * 100}% ${profile.cover.focalY * 100}%` }}/> : <><div className="profile-cover-fallback absolute inset-0"/><div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,48,40,.26)] to-transparent"/></>}
          {profile.isDemo && <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-semibold text-[var(--muted)] backdrop-blur">Perfil demostrativo</span>}
        </div>
        <div className="relative -mt-12 flex flex-col gap-4 px-3 sm:-mt-14 sm:flex-row sm:items-end sm:px-6">
          <Avatar initials={card.initials} tone={card.avatarTone} imageUrl={profile.avatar?.url ?? card.avatarUrl} className="size-24 border-[5px] border-[var(--paper)] shadow-lg sm:size-28"/>
          <div className="min-w-0 pb-1 sm:pb-2"><p className="section-kicker">{profile.headline}</p><h1 className="mt-1 text-4xl font-semibold tracking-[-.045em] sm:text-6xl">{profile.displayName}</h1><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{profile.reviewCount ? `${profile.rating?.toFixed(1)} · ${profile.reviewCount} opiniones de usuarios · ` : "Sin opiniones todavía · "}{profile.experienceYears} años de experiencia</p></div>
        </div>
      </div>
    </section>

    <div className="mx-auto grid max-w-[1100px] gap-9 px-4 py-9 sm:px-6 sm:py-12 lg:grid-cols-[1fr_330px] lg:px-8 lg:py-16">
      <div className="grid gap-9 sm:gap-10">
        <section><h2 className="text-2xl font-semibold">Sobre mi trabajo</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">{profile.bio}</p></section>
        <section><h2 className="text-2xl font-semibold">Servicios publicados</h2><div className="mt-4 grid gap-3">{profile.services.map((service) => <Link key={service.id} href={`/profesionales/${profile.slug}/servicios/${service.slug}`} className="rounded-2xl border border-[var(--line)] bg-white p-5 transition hover:border-[var(--brand)]"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{service.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{service.description}</p></div><Icon name="arrow-right" className="mt-1 size-5 shrink-0 text-[var(--brand)]"/></div><p className="mt-4 text-sm font-semibold">{formatPrice(service.pricingMode, service.priceAmount)}</p></Link>)}</div></section>
        <section className="grid gap-3 sm:grid-cols-2"><Detail title="Dónde trabaja" text={profile.zones.join(", ")}/><Detail title="Modalidad" text={profile.serviceMode === "ambos" ? "A domicilio y taller" : profile.serviceMode === "domicilio" ? "A domicilio" : "En taller"}/></section>
        <section><div className="flex items-end justify-between gap-4"><div><p className="section-kicker">Galería</p><h2 className="mt-2 text-2xl font-semibold">Trabajos realizados</h2></div>{profile.isDemo && <span className="text-xs text-[var(--muted)]">Contenido demo</span>}</div><PublicGallery items={profile.portfolio}/></section>
        <section><h2 className="text-2xl font-semibold">Opiniones de usuarios</h2><p className="mt-2 text-xs leading-5 text-[var(--muted)]">Se moderan antes de publicarse, pero no prueban que un trabajo haya sido contratado.</p><div className="mt-5 rounded-2xl border border-dashed border-[var(--line)] p-6 text-sm text-[var(--muted)]">{profile.isDemo ? "Las opiniones mostradas en la demo no pertenecen a personas reales." : "Las opiniones publicadas aparecerán en este espacio."}</div></section>
      </div>
      <aside id="contacto" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start"><div className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-lg"><p className="text-xs text-[var(--muted)]">Precio orientativo</p><p className="mt-1 text-2xl font-semibold">{formatPrice(card.pricingMode, card.priceAmount)}</p><p className="mt-3 text-xs leading-5 text-[var(--muted)]">Consultá alcance, materiales y valor final directamente.</p><div className="my-5 h-px bg-[var(--line)]"/><ProfileActions profile={card}/></div></aside>
    </div>

    <div className="fixed inset-x-3 bottom-3 z-40 rounded-full border border-white/15 bg-[rgba(10,45,38,.94)] p-1.5 shadow-2xl backdrop-blur lg:hidden"><a href="#contacto" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--lime)] px-5 text-sm font-semibold text-[var(--ink)]"><Icon name="message" className="size-5"/> Ver opciones de contacto</a></div>
  </main>;
}

function Detail({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl bg-[var(--paper)] p-5"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-[var(--muted)]">{text || "A coordinar"}</p></div>;
}
