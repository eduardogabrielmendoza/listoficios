import Link from "next/link";
import { DiscoveryExperience } from "@/components/discovery-experience";
import { HomeMotionLoader } from "@/components/home-motion-loader";
import { HomeServicesStory } from "@/components/home-services-story";
import { HomeStory } from "@/components/home-story";
import { Icon } from "@/components/icons";
import { categories, professionals } from "@/lib/mock-data";

const steps = [
  { number: "01", icon: "search" as const, title: "Buscá el servicio", copy: "Escribí qué necesitás o explorá por oficio y zona." },
  { number: "02", icon: "users" as const, title: "Compará perfiles", copy: "Revisá experiencia, descripción, modalidad y precio orientativo." },
  { number: "03", icon: "message" as const, title: "Hablá por WhatsApp", copy: "Consultá directamente, sin reservas ni procesos complicados." },
];

const trustItems = [
  { icon: "user" as const, title: "Perfil", copy: "Experiencia y servicios" },
  { icon: "location" as const, title: "Cobertura", copy: "Zonas de trabajo" },
  { icon: "message" as const, title: "Contacto", copy: "Conversación directa" },
];

function StepPreview({ index }: { index: number }) {
  if (index === 0) return <div className="how-preview how-search-preview"><Icon name="search" className="size-4" /><span>Arreglar una pérdida…</span><i /></div>;
  if (index === 1) return <div className="how-preview how-profiles-preview"><span /><span /><span /></div>;
  return <div className="how-preview how-chat-preview"><span>Hola, vi tu perfil…</span><i><Icon name="check" className="size-3" /></i></div>;
}

export default function Home() {
  return (
    <main className="overflow-hidden" data-motion-home>
      <DiscoveryExperience categories={categories} initialProfessionals={professionals} />
      <HomeStory professionals={professionals} />
      <HomeServicesStory />

      <section id="como-funciona" data-motion-how className="how-journey scroll-mt-20">
        <div className="mx-auto max-w-[1180px]">
          <div data-motion-how-heading className="mx-auto max-w-2xl text-center"><p className="section-kicker">Simple de principio a fin</p><h2 className="section-title mt-3">Encontrar ayuda no debería ser complicado.</h2><p className="section-copy mx-auto mt-5">Tres pasos que cualquier persona puede entender y usar.</p></div>
          <div className="how-map">
            <div className="how-map-grid" aria-hidden="true" />
            <span data-motion-how-float className="how-map-label how-map-label-a"><Icon name="location" className="size-4" /> Bella Vista</span>
            <span data-motion-how-float className="how-map-label how-map-label-b"><Icon name="check" className="size-4" /> Sin cuenta</span>
            <span data-motion-how-float className="how-map-label how-map-label-c"><Icon name="message" className="size-4" /> WhatsApp</span>
            <svg className="how-map-route" viewBox="0 0 1080 310" fill="none" aria-hidden="true"><path data-motion-how-path d="M75 170C210 30 322 48 410 158C498 268 622 270 694 145C766 20 902 35 1000 158" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M75 170C210 30 322 48 410 158C498 268 622 270 694 145C766 20 902 35 1000 158" stroke="currentColor" strokeWidth="12" strokeLinecap="round" opacity=".05" /></svg>
            <div className="how-map-steps">
              {steps.map((step, index) => <article data-motion-step key={step.number} className={`how-step how-step-${index + 1}`}>
                <div className="how-step-top"><span className="how-step-icon"><Icon name={step.icon} className="size-6" /></span><span className="how-step-number">{step.number}</span></div>
                <div><h3>{step.title}</h3><p>{step.copy}</p></div><StepPreview index={index} />
              </article>)}
            </div>
          </div>
        </div>
      </section>

      <section id="confianza" data-motion-trust className="scroll-mt-20 px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-[38px] bg-[var(--ink)] lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative min-h-[430px] overflow-hidden bg-[#b8d8cb] p-8 sm:p-10">
            <div className="trust-grid absolute inset-0 opacity-60" />
            <svg className="trust-route" viewBox="0 0 520 390" fill="none" aria-hidden="true"><path data-motion-trust-path d="M72 78C187 72 158 188 270 190C385 192 348 307 463 312" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <div className="relative grid h-full content-between gap-5">{trustItems.map((item, index) => <div data-motion-trust-node key={item.title} className={`trust-route-card trust-route-card-${index + 1}`}><span><Icon name={item.icon} className="size-5" /></span><div><p>{item.title}</p><small>{item.copy}</small></div></div>)}</div>
          </div>
          <div className="flex flex-col justify-center p-8 text-white sm:p-12 lg:p-16"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--lime)]">Confianza con información</p><h2 className="mt-4 max-w-[520px] text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[1.02] tracking-[-.05em]">Más claridad antes de llamar.</h2><p className="mt-6 max-w-[520px] text-base leading-7 text-white/65">Listoficios organiza la información para ayudarte a elegir. El acuerdo y la contratación se realizan directamente entre las personas.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{["Información fácil de comparar", "Perfiles completos", "Reportes para moderación", "Contacto sin comisiones"].map((item) => <p key={item} className="flex items-center gap-2.5 text-sm font-medium"><span className="grid size-6 place-items-center rounded-full bg-white/10 text-[var(--lime)]"><Icon name="check" className="size-3.5" /></span>{item}</p>)}</div></div>
        </div>
      </section>

      <section data-motion-final className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28"><div className="relative mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-8 overflow-hidden rounded-[34px] bg-[var(--lime)] p-8 sm:p-10 lg:flex-row lg:items-center lg:p-14"><div data-motion-final-circle className="absolute -right-10 -top-24 size-72 rounded-full border-[50px] border-white/25" /><div data-motion-final-content className="relative max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#456c21]">¿Tenés un oficio?</p><h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.045em] sm:text-4xl">Tu próximo cliente puede estar a pocas cuadras.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#42602c] sm:text-base">Publicá lo que hacés y dejá que Bella Vista te encuentre.</p></div><Link data-motion-final-content href="/crear-cuenta?next=/profesionales/crear-perfil" className="primary-button relative">Publicar mi servicio <Icon name="arrow-right" className="size-4" /></Link></div></section>
      <HomeMotionLoader />
    </main>
  );
}
