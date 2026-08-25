"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { useSiteConfig } from "@/components/site-config-provider";

const needs = ["Algo se rompió", "Quiero mejorar mi casa", "Necesito ayuda esta semana"];
const trades: Array<{ icon: IconName; label: string }> = [
  { icon: "wrench", label: "Plomería" },
  { icon: "bolt", label: "Electricidad" },
  { icon: "paint", label: "Pintura" },
  { icon: "hammer", label: "Carpintería" },
  { icon: "brick", label: "Albañilería" },
  { icon: "leaf", label: "Jardinería" },
];
const zones = ["Centro", "Los Pinos", "Villa Nueva", "Santa Rita", "Alrededores"];

export function HomeServicesStory() {
  const site = useSiteConfig();
  return (
    <section id="servicios-cerca" data-motion-services className="services-story scroll-mt-24">
      <header data-services-intro className="services-story-intro">
        <div className="motion-mask">
          <div data-services-intro-copy>
            <p className="section-kicker">{site.motion.servicesEyebrow}</p>
            <h2 className="section-title mt-3">{site.motion.servicesTitle}</h2>
            <p className="section-copy mt-5">Una guía visual para entender todo lo que podés explorar antes de hablar con alguien.</p>
          </div>
        </div>
      </header>

      <div data-services-sticky className="services-story-sticky">
        <div className="services-story-shell">
          <nav className="services-story-index" aria-label="Etapas del mapa de posibilidades">
            {["Necesidad", "Oficios", "Cobertura", "Claridad"].map((label, index) => (
              <span data-services-dot key={label}><i>{String(index + 1).padStart(2, "0")}</i><strong>{label}</strong></span>
            ))}
          </nav>

          <div className="services-story-viewport">
            <article data-services-scene className="services-story-scene services-need-scene">
              <div className="services-story-copy" data-services-piece>
                <span className="services-story-step">01 / Lo que necesitás</span>
                <h3>{site.motion.servicesNeedText}</h3>
                <p>No hace falta conocer el nombre técnico. Una necesidad cotidiana es suficiente para comenzar.</p>
              </div>
              <div className="services-need-board" aria-label="Ejemplos visuales de necesidades">
                <span className="services-orbit services-orbit-a" aria-hidden="true" />
                <span className="services-orbit services-orbit-b" aria-hidden="true" />
                {needs.map((need, index) => <span data-services-piece className={`services-need-token token-${index + 1}`} key={need}><Icon name={index === 0 ? "wrench" : index === 1 ? "sparkles" : "clock"} className="size-5" />{need}</span>)}
                <div data-services-piece className="services-need-center"><Icon name="search" className="size-6" /><span><small>Contanos con tus palabras</small><strong>¿Qué necesitás resolver?</strong></span></div>
              </div>
            </article>

            <article data-services-scene className="services-story-scene services-trades-scene">
              <div className="services-story-copy" data-services-piece>
                <span className="services-story-step">02 / Oficios</span>
                <h3>{site.motion.servicesCategoriesText}</h3>
                <p>Las categorías ordenan posibilidades sin obligarte a saber exactamente a quién buscar.</p>
              </div>
              <div className="services-trade-grid" aria-label="Ejemplos visuales de categorías de servicios">
                {trades.map((trade, index) => <div data-services-piece key={trade.label} className={index === 0 ? "is-emphasized" : ""}><span><Icon name={trade.icon} className="size-5" /></span><strong>{trade.label}</strong><small>Servicio local</small></div>)}
              </div>
            </article>

            <article data-services-scene className="services-story-scene services-zones-scene">
              <div className="services-story-copy" data-services-piece>
                <span className="services-story-step">03 / Cobertura</span>
                <h3>{site.motion.servicesZonesText}</h3>
                <p>La zona ayuda a encontrar opciones cercanas sin compartir ubicaciones exactas.</p>
              </div>
              <div className="services-zone-map" aria-label="Mapa ilustrativo de cobertura en Bella Vista">
                <div className="services-map-grid" aria-hidden="true" />
                <svg viewBox="0 0 520 390" fill="none" aria-hidden="true"><path data-services-map-path d="M62 210C112 92 218 84 255 182C292 280 392 294 458 164" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M62 210C112 92 218 84 255 182C292 280 392 294 458 164" stroke="currentColor" strokeWidth="14" strokeLinecap="round" opacity=".05" /></svg>
                {zones.map((zone, index) => <span data-services-piece key={zone} className={`services-zone-node zone-${index + 1}`}><i />{zone}</span>)}
                <div data-services-piece className="services-map-label"><Icon name="location" className="size-5" /><span><small>Ciudad operativa</small><strong>Bella Vista</strong></span></div>
              </div>
            </article>

            <article data-services-scene className="services-story-scene services-clarity-scene">
              <div className="services-story-copy" data-services-piece>
                <span className="services-story-step">04 / Información</span>
                <h3>{site.motion.servicesClarityText}</h3>
                <p>Listoficios organiza datos útiles. La conversación y el acuerdo siguen siendo directos.</p>
              </div>
              <div className="services-clarity-board" aria-label="Ejemplo visual de información para comparar">
                <div data-services-piece className="services-clarity-heading"><span>Información del servicio</span><i>Ejemplo visual</i></div>
                <div className="services-clarity-grid">
                  <span data-services-piece><Icon name="tag" className="size-5" /><small>Servicio</small><strong>Descripción clara</strong></span>
                  <span data-services-piece><Icon name="clock" className="size-5" /><small>Experiencia</small><strong>Trayectoria informada</strong></span>
                  <span data-services-piece><Icon name="location" className="size-5" /><small>Cobertura</small><strong>Zonas de trabajo</strong></span>
                  <span data-services-piece><Icon name="message" className="size-5" /><small>Contacto</small><strong>Conversación directa</strong></span>
                </div>
                <div data-services-piece className="services-clarity-status"><Icon name="check" className="size-4" /> Todo en un mismo lugar para comparar con calma</div>
              </div>
            </article>
          </div>

          <div className="services-story-navigation" aria-hidden="true"><span><i data-services-progress /></span><p><Icon name="chevron-down" className="size-4" /> Deslizá para descubrir</p></div>
        </div>
      </div>

      <div className="services-story-outro">
        <p>Cuando quieras pasar de la idea a la búsqueda, el directorio completo estará listo.</p>
        <Link href="/servicios" className="primary-button">Explorar todos los servicios <Icon name="arrow-right" className="size-4" /></Link>
      </div>
    </section>
  );
}
