import Link from "next/link";
import { DiscoveryExperience } from "@/components/discovery-experience";
import { HomeMotionLoader } from "@/components/home-motion-loader";
import { HomeProfessionals } from "@/components/home-professionals";
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

export default function Home() {
  return (
    <main className="overflow-hidden" data-motion-home>
      <DiscoveryExperience categories={categories} initialProfessionals={professionals} />
      <HomeStory professionals={professionals} />
      <HomeProfessionals initialProfessionals={professionals} />

      <section id="como-funciona" data-motion-how className="scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-[1180px]">
          <div className="mx-auto max-w-2xl text-center"><p className="section-kicker">Simple de principio a fin</p><h2 className="section-title mt-3">Encontrar ayuda no debería ser complicado.</h2><p className="section-copy mx-auto mt-5">Tres pasos que cualquier persona puede entender y usar.</p></div>
          <div className="relative mt-14 grid gap-5 lg:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-10 hidden border-t border-dashed border-[#bed2cb] lg:block" />
            {steps.map((step) => <article data-motion-step key={step.number} className="relative rounded-[28px] border border-[var(--line)] bg-white p-6 lg:border-0 lg:bg-transparent lg:p-8 lg:text-center"><div className="relative z-10 flex items-center gap-4 lg:flex-col"><span className="grid size-20 shrink-0 place-items-center rounded-[25px] border-8 border-white bg-[#e6f2ed] text-[var(--brand)] shadow-lg"><Icon name={step.icon} className="size-7" /></span><span className="absolute -left-1 -top-2 grid size-7 place-items-center rounded-full bg-[var(--lime)] text-[10px] font-semibold lg:left-[calc(50%-48px)]">{step.number}</span><div className="lg:mt-4"><h3 className="text-lg font-semibold tracking-[-.025em]">{step.title}</h3><p className="mt-2 max-w-[300px] text-sm leading-6 text-[var(--muted)]">{step.copy}</p></div></div></article>)}
          </div>
        </div>
      </section>

      <section id="confianza" data-motion-trust className="scroll-mt-20 px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-[38px] bg-[var(--ink)] lg:grid-cols-[.95fr_1.05fr]">
          <div className="relative min-h-[430px] overflow-hidden bg-[#b8d8cb] p-8 sm:p-10">
            <div className="trust-grid absolute inset-0 opacity-60" />
            <svg className="trust-route" viewBox="0 0 520 390" fill="none" aria-hidden="true"><path data-motion-trust-path d="M72 78C187 72 158 188 270 190C385 192 348 307 463 312" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <div className="relative grid h-full content-between gap-5">
              {trustItems.map((item, index) => <div data-motion-trust-node key={item.title} className={`trust-route-card trust-route-card-${index + 1}`}><span><Icon name={item.icon} className="size-5" /></span><div><p>{item.title}</p><small>{item.copy}</small></div></div>)}
            </div>
          </div>
          <div className="flex flex-col justify-center p-8 text-white sm:p-12 lg:p-16">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--lime)]">Confianza con información</p>
            <h2 className="mt-4 max-w-[520px] text-[clamp(2.25rem,4.5vw,4rem)] font-semibold leading-[1.02] tracking-[-.05em]">Más claridad antes de llamar.</h2>
            <p className="mt-6 max-w-[520px] text-base leading-7 text-white/65">Listoficios organiza la información para ayudarte a elegir. El acuerdo y la contratación se realizan directamente entre las personas.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">{["Información fácil de comparar", "Perfiles completos", "Reportes para moderación", "Contacto sin comisiones"].map((item) => <p key={item} className="flex items-center gap-2.5 text-sm font-medium"><span className="grid size-6 place-items-center rounded-full bg-white/10 text-[var(--lime)]"><Icon name="check" className="size-3.5" /></span>{item}</p>)}</div>
          </div>
        </div>
      </section>

      <section data-motion-final className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="relative mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-8 overflow-hidden rounded-[34px] bg-[var(--lime)] p-8 sm:p-10 lg:flex-row lg:items-center lg:p-14">
          <div data-motion-final-circle className="absolute -right-10 -top-24 size-72 rounded-full border-[50px] border-white/25" />
          <div data-motion-final-content className="relative max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.15em] text-[#456c21]">¿Tenés un oficio?</p><h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.045em] sm:text-4xl">Tu próximo cliente puede estar a pocas cuadras.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-[#42602c] sm:text-base">Publicá lo que hacés y dejá que Bella Vista te encuentre.</p></div>
          <Link data-motion-final-content href="/crear-cuenta?next=/profesionales/crear-perfil" className="primary-button relative">Publicar mi servicio <Icon name="arrow-right" className="size-4" /></Link>
        </div>
      </section>
      <HomeMotionLoader />
    </main>
  );
}
