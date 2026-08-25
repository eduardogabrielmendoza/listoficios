"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icons";
import type { ServiceProfile } from "@/lib/app-types";
import { formatPrice } from "@/lib/mock-data";

const serviceModeLabel = {
  domicilio: "A domicilio",
  taller: "En su taller",
  ambos: "A domicilio y taller",
} as const;

function ProfileScene({ profile, index }: { profile: ServiceProfile; index: number }) {
  const number = String(index + 1).padStart(2, "0");
  const reviews = profile.reviews
    ? `${profile.rating.toFixed(1)} · ${profile.reviews} opiniones`
    : "Perfil nuevo";

  return (
    <article data-professional-scene className="home-professional-scene">
      <div className="home-professional-portrait" data-professional-piece>
        <span className="home-professional-watermark" aria-hidden="true">{profile.trade}</span>
        <span className="home-professional-scene-number" aria-hidden="true">{number}</span>
        <div className="home-professional-avatar-wrap">
          <Avatar
            initials={profile.initials}
            tone={profile.avatarTone}
            imageUrl={profile.avatarUrl}
            className="home-professional-avatar"
          />
          <span><i /> Disponible en Bella Vista</span>
        </div>
      </div>

      <div className="home-professional-detail">
        <div data-professional-piece>
          <p className="home-professional-overline">Profesional destacado · {number}</p>
          <h3>{profile.name}</h3>
          <p className="home-professional-trade">{profile.trade}</p>
        </div>

        <p data-professional-piece className="home-professional-description">
          {profile.description}
        </p>

        <div data-professional-piece className="home-professional-facts">
          <span><Icon name="location" className="size-4" /><small>Zona</small><strong>{profile.zones[0] ?? "Bella Vista"}</strong></span>
          <span><Icon name="clock" className="size-4" /><small>Respuesta</small><strong>{profile.responseTime}</strong></span>
          <span><Icon name="star" className="size-4" /><small>Opiniones</small><strong>{reviews}</strong></span>
        </div>

        <div data-professional-piece className="home-professional-skills">
          {profile.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}
          <span>{serviceModeLabel[profile.serviceMode]}</span>
        </div>

        <div data-professional-piece className="home-professional-action">
          <div><small>Precio orientativo</small><strong>{formatPrice(profile.pricingMode, profile.priceAmount)}</strong></div>
          <Link href={`/profesionales/${profile.slug}`} className="primary-button">
            Ver perfil <Icon name="arrow-right" className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function HomeProfessionals({ initialProfessionals }: { initialProfessionals: ServiceProfile[] }) {
  const [professionals, setProfessionals] = useState(initialProfessionals.slice(0, 3));

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/v1/professionals?limit=3", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (payload?.data?.length) setProfessionals(payload.data.slice(0, 3));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return (
    <section id="profesionales" data-motion-professionals className="home-professionals scroll-mt-24">
      <div data-professionals-sticky className="home-professionals-sticky">
        <div className="home-professionals-shell">
          <header data-motion-professional-heading className="home-professionals-heading">
            <div className="motion-mask">
              <div data-motion-professional-title>
                <p className="section-kicker">Perfiles para conocer</p>
                <h2 className="section-title mt-3">Servicios cerca tuyo</h2>
                <p className="section-copy mt-4">Información simple para comparar antes de hablar.</p>
              </div>
            </div>
            <div className="home-professionals-summary">
              <span><strong>{professionals.length}</strong> perfiles destacados</span>
              <span><i /> Bella Vista</span>
            </div>
            <Link href="/profesionales" className="hidden secondary-button sm:inline-flex">Ver todos</Link>
          </header>

          <div className="home-professionals-experience">
            <nav className="home-professional-index" aria-label="Perfiles destacados">
              {professionals.map((profile, index) => (
                <span data-professional-dot key={`${profile.id}-${index}`}>
                  <i>{String(index + 1).padStart(2, "0")}</i>
                  <strong>{profile.trade}</strong>
                </span>
              ))}
            </nav>

            <div className="home-professional-stage">
              {professionals.map((profile, index) => (
                <ProfileScene key={index} profile={profile} index={index} />
              ))}
            </div>
          </div>

          <div className="home-professional-timeline" aria-hidden="true">
            <span data-professional-progress />
          </div>
          <p className="home-professional-scroll-hint" aria-hidden="true"><Icon name="chevron-down" className="size-4" /> Deslizá para comparar</p>
          <Link href="/profesionales" className="primary-button mt-7 w-full sm:hidden">Ver todos los profesionales <Icon name="arrow-right" className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}
