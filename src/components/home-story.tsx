"use client";

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
        <div className="story-ambient" aria-hidden="true"><span data-story-orbit /><span data-story-orbit /><span data-story-orbit /></div>
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
                <div className="story-mini-tags" data-story-piece><span>En casa</span><span>Lo antes posible</span></div>
              </div>
              <div className="need-composition" aria-hidden="true">
                <span data-story-piece className="need-signal need-signal-a"><Icon name="droplet" className="size-4" /> Goteo constante</span>
                <span data-story-piece className="need-signal need-signal-b"><Icon name="location" className="size-4" /> Centro</span>
                <span data-story-piece className="need-signal need-signal-c"><Icon name="clock" className="size-4" /> Esta semana</span>
                <span data-story-piece className="need-shape need-shape-a" />
                <span data-story-piece className="need-shape need-shape-b" />
                <span data-story-piece className="need-shape need-shape-c" />
                <div data-story-piece className="need-query"><span className="need-query-icon"><Icon name="search" className="size-5" /></span><span><small>Estoy buscando</small><strong>{site.motion.searchText}</strong></span><i /></div>
              </div>
            </article>

            <article className="home-story-scene home-story-search" data-story-scene>
              <div className="story-copy">
                <span className="story-index">02 / Búsqueda</span>
                <h3>La búsqueda ordena las opciones.</h3>
                <p>El servicio, Bella Vista y tu zona quedan reunidos sin formularios ni pasos innecesarios.</p>
                <div className="story-mini-tags" data-story-piece><span>6 resultados</span><span>Bella Vista</span></div>
              </div>
              <div className="story-search-surface">
                <div data-story-piece className="story-search-query"><Icon name="search" className="size-5" /><strong>{site.motion.searchText}</strong><span>Buscar</span></div>
                <div data-story-piece className="story-search-zone"><Icon name="location" className="size-4" />Bella Vista · Toda la ciudad <Icon name="chevron-down" className="ml-auto size-4" /></div>
                <div className="story-search-results">
                  {professionals.slice(0, 3).map((profile) => <div data-story-piece key={profile.id} className="story-search-result"><Avatar initials={profile.initials} tone={profile.avatarTone} imageUrl={profile.avatarUrl} className="size-10" /><span><strong>{profile.name}</strong><small>{profile.trade} · {profile.zones[0]}</small></span><Icon name="arrow-right" className="size-4" /></div>)}
                </div>
              </div>
            </article>

            <article className="home-story-scene home-story-compare" data-story-scene>
              <div className="story-copy">
                <span className="story-index">03 / Comparación</span>
                <h3>{site.motion.compareText}</h3>
                <p>Información concreta para elegir con más tranquilidad antes de llamar.</p>
                <div className="story-mini-tags" data-story-piece><span>Zona</span><span>Experiencia</span><span>Precio</span></div>
              </div>
              <div className="story-profile-stack">
                <div data-story-piece className="story-stack-label"><span>Perfiles encontrados</span><strong>{professionals.slice(0, 3).length}</strong></div>
                {professionals.slice(0, 3).map((profile, index) => (
                  <div data-home-demo data-story-piece key={profile.id} className={`story-profile-card ${index === 0 ? "is-featured" : ""}`}>
                    <Avatar initials={profile.initials} tone={profile.avatarTone} imageUrl={profile.avatarUrl} className="size-12" />
                    <span className="min-w-0 flex-1"><strong>{profile.name}</strong><small>{profile.trade} · {profile.zones[0]}</small><i>{profile.experienceYears} años de experiencia</i></span>
                    <span className="story-profile-price">{formatPrice(profile.pricingMode, profile.priceAmount)}</span>
                    <span className="story-demo-label">Ejemplo</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="home-story-scene home-story-contact" data-story-scene>
              <div className="story-copy">
                <span className="story-index">04 / Contacto</span>
                <h3>{site.motion.finalText}</h3>
                <p>Listoficios te acerca el perfil. La conversación y el acuerdo siguen siendo entre ustedes.</p>
                <div className="story-mini-tags" data-story-piece><span>Sin comisiones</span><span>Sin intermediarios</span></div>
              </div>
              <div className="story-contact-card">
                <div data-story-piece className="story-contact-person">
                  {featured ? <Avatar initials={featured.initials} tone={featured.avatarTone} imageUrl={featured.avatarUrl} className="size-14" /> : null}
                  <span><strong>{featured?.name ?? "Profesional local"}</strong><small>Disponible en Bella Vista</small></span><span className="story-online" />
                </div>
                <div data-story-piece className="story-message"><Icon name="message" className="size-5" /><p>{site.motion.contactText}</p></div>
                <div data-story-piece className="story-message story-message-reply"><p>¡Hola! Contame un poco más y coordinamos.</p><Icon name="check" className="size-4" /></div>
                <div data-story-piece className="story-direct-line"><span /><p><Icon name="shield" className="size-4" /> Contacto directo</p><span /></div>
                <div data-home-demo data-story-piece className="story-contact-cta"><Icon name="check" className="size-4" /> Contacto preparado <span>Ejemplo visual</span></div>
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
