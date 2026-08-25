"use client";

import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import { useSiteConfig } from "@/components/site-config-provider";
import type { ServiceProfile } from "@/lib/app-types";
import { formatPrice } from "@/lib/mock-data";

export function HomeStory({ professionals }: { professionals: ServiceProfile[] }) {
  const site = useSiteConfig();
  const featured = professionals.find((profile) => profile.slug === site.home.featuredProfileSlug) ?? professionals[0];

  return (
    <section className="home-story" data-motion-story aria-labelledby="home-story-title">
      <div className="home-story-sticky" data-story-sticky>
        <div className="home-story-shell">
          <header className="home-story-heading">
            <p className="home-story-kicker">{site.motion.storyEyebrow}</p>
            <h2 id="home-story-title">Una búsqueda clara, de principio a fin.</h2>
          </header>

          <div className="home-story-viewport">
            <article className="home-story-scene home-story-need" data-story-scene>
              <div className="story-copy">
                <span className="story-index">01 / Necesidad</span>
                <h3>{site.motion.needText}</h3>
                <p>No hace falta saber el nombre técnico del problema. Contanos qué necesitás con tus palabras.</p>
              </div>
              <div className="need-composition" aria-hidden="true">
                <span className="need-shape need-shape-a" />
                <span className="need-shape need-shape-b" />
                <span className="need-shape need-shape-c" />
                <div className="need-query"><Icon name="search" className="size-5" />{site.motion.searchText}</div>
              </div>
            </article>

            <article className="home-story-scene home-story-search" data-story-scene>
              <div className="story-copy">
                <span className="story-index">02 / Búsqueda</span>
                <h3>Listoficios ordena las opciones.</h3>
                <p>El servicio, Bella Vista y tu zona quedan reunidos en una búsqueda simple.</p>
              </div>
              <div className="story-search-surface">
                <div className="story-search-query"><Icon name="search" className="size-5" /><strong>{site.motion.searchText}</strong></div>
                <div className="story-search-zone"><Icon name="location" className="size-4" />Bella Vista · Toda la ciudad</div>
                <div className="story-result-bars" aria-hidden="true"><span /><span /><span /></div>
              </div>
            </article>

            <article className="home-story-scene home-story-compare" data-story-scene>
              <div className="story-copy">
                <span className="story-index">03 / Comparación</span>
                <h3>{site.motion.compareText}</h3>
                <p>Información concreta para elegir con más tranquilidad antes de llamar.</p>
              </div>
              <div className="story-profile-stack">
                {professionals.slice(0, 3).map((profile, index) => (
                  <Link key={profile.id} href={`/profesionales/${profile.slug}`} className={`story-profile-card ${index === 0 ? "is-featured" : ""}`}>
                    <Avatar initials={profile.initials} tone={profile.avatarTone} imageUrl={profile.avatarUrl} className="size-12" />
                    <span className="min-w-0 flex-1"><strong>{profile.name}</strong><small>{profile.trade} · {profile.zones[0]}</small></span>
                    <span className="story-profile-price">{formatPrice(profile.pricingMode, profile.priceAmount)}</span>
                    <Icon name="arrow-right" className="size-4" />
                  </Link>
                ))}
              </div>
            </article>

            <article className="home-story-scene home-story-contact" data-story-scene>
              <div className="story-copy">
                <span className="story-index">04 / Contacto</span>
                <h3>{site.motion.finalText}</h3>
                <p>Listoficios te acerca el perfil. La conversación y el acuerdo siguen siendo entre ustedes.</p>
              </div>
              <div className="story-contact-card">
                <div className="story-contact-person">
                  {featured ? <Avatar initials={featured.initials} tone={featured.avatarTone} imageUrl={featured.avatarUrl} className="size-14" /> : null}
                  <span><strong>{featured?.name ?? "Profesional local"}</strong><small>Disponible en Bella Vista</small></span>
                  <span className="story-online" />
                </div>
                <div className="story-message"><Icon name="message" className="size-5" /><p>{site.motion.contactText}</p></div>
                <Link href={featured ? `/profesionales/${featured.slug}` : "/profesionales"} className="story-contact-cta">Ver perfil y contactar <Icon name="arrow-right" className="size-4" /></Link>
              </div>
            </article>
          </div>

          <div className="home-story-navigation" aria-hidden="true">
            <span className="home-story-progress"><i data-story-progress /></span>
            {[0, 1, 2, 3].map((index) => <span key={index} className="home-story-dot" data-story-dot />)}
          </div>
        </div>
      </div>
    </section>
  );
}
