"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { ProfessionalCard } from "@/components/professional-card";
import type { ServiceProfile } from "@/lib/app-types";

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
    <section id="profesionales" data-motion-professionals className="scroll-mt-24 bg-[var(--paper)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex items-end justify-between gap-4">
          <div><p className="section-kicker">Perfiles para conocer</p><h2 className="section-title mt-3">Servicios cerca tuyo</h2><p className="section-copy mt-4">Información simple para comparar antes de hablar.</p></div>
          <Link href="/profesionales" className="hidden secondary-button sm:inline-flex">Ver todos</Link>
        </div>
        <div className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.slice(0, 3).map((profile) => <div key={profile.id} data-motion-professional-card><ProfessionalCard professional={profile} /></div>)}
        </div>
        <Link href="/profesionales" className="primary-button mt-7 w-full sm:hidden">Ver todos los profesionales <Icon name="arrow-right" className="size-4" /></Link>
      </div>
    </section>
  );
}
