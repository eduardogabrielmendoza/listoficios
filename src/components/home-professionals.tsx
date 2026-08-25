"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { ProfessionalCard } from "@/components/professional-card";
import type { ServiceProfile } from "@/lib/app-types";

const serviceHints = ["Plomería", "Electricidad", "Pintura", "Carpintería", "Jardinería"];

export function HomeProfessionals({ initialProfessionals }: { initialProfessionals: ServiceProfile[] }) {
  const [professionals, setProfessionals] = useState(initialProfessionals);

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/v1/professionals?limit=3", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => { if (payload?.data?.length) setProfessionals(payload.data); })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return (
    <section id="profesionales" data-motion-professionals className="home-professionals scroll-mt-24">
      <div className="mx-auto max-w-[1180px]">
        <div data-motion-professional-heading className="home-professionals-heading">
          <div className="motion-mask"><div data-motion-professional-title><p className="section-kicker">Perfiles para conocer</p><h2 className="section-title mt-3">Servicios cerca tuyo</h2><p className="section-copy mt-4">Información simple para comparar antes de hablar.</p></div></div>
          <div className="home-professionals-summary"><span><strong>{professionals.length}</strong> perfiles destacados</span><span><i /> Bella Vista</span></div>
          <Link href="/profesionales" className="hidden secondary-button sm:inline-flex">Ver todos</Link>
        </div>

        <div className="home-service-track" aria-hidden="true">
          <span data-motion-professional-rule className="home-service-line" />
          <div>{serviceHints.map((service, index) => <span data-motion-professional-chip key={service}><i>{String(index + 1).padStart(2, "0")}</i>{service}</span>)}</div>
        </div>

        <div className="home-professional-grid">
          {professionals.slice(0, 3).map((profile, index) => <div key={profile.id} data-motion-professional-card className="home-professional-frame"><span className="home-card-index">0{index + 1}</span><ProfessionalCard professional={profile} /></div>)}
        </div>
        <Link href="/profesionales" className="primary-button mt-7 w-full sm:hidden">Ver todos los profesionales <Icon name="arrow-right" className="size-4" /></Link>
      </div>
    </section>
  );
}
