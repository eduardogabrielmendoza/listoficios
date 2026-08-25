import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";
import { adminOperationalOverview } from "@/data/admin-console";

export default async function AdminPage() {
  const data = await adminOperationalOverview();
  const cards: Array<[string, number, IconName, string]> = [
    ["Casos por revisar", data.moderation, "moderation", "/admin/moderacion"],
    ["Imágenes pendientes", data.images, "images", "/admin/imagenes"],
    ["Opiniones pendientes", data.reviews, "star", "/admin/opiniones"],
    ["Reportes abiertos", data.reports, "reports", "/admin/reportes"],
    ["Consultas abiertas", data.support, "support", "/admin/soporte"],
    ["Perfiles suspendidos", data.suspended, "lock", "/admin/perfiles"],
  ];
  return <main className="p-4 sm:p-7 lg:p-9"><div className="mx-auto max-w-[1180px]">
    <p className="section-kicker">Resumen operativo</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Todo lo importante, en un lugar.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Moderación, soporte y estado de la comunidad de Bella Vista.</p>
    <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, count, icon, href]) => <Link key={label} href={href} className="group rounded-[22px] border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#b9cec7] hover:shadow-[0_14px_35px_rgba(9,48,40,.06)]"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-[#edf4f1] text-[var(--brand)]"><Icon name={icon} className="size-5"/></span><Icon name="arrow-right" className="size-4 text-[var(--muted)] transition group-hover:translate-x-0.5"/></div><p className="mt-6 text-3xl font-semibold">{count}</p><p className="mt-1 text-sm text-[var(--muted)]">{label}</p></Link>)}</div>
    <section className="mt-8 rounded-[26px] bg-[var(--ink)] p-6 text-white sm:p-8"><p className="text-xs font-semibold uppercase tracking-[.13em] text-[var(--lime)]">Criterio editorial</p><h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-.03em] sm:text-3xl">Revisar con contexto antes de tomar una decisión.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Los filtros automáticos ayudan a ordenar la cola. Las suspensiones, rechazos y cambios de rol siempre requieren una decisión humana y quedan auditados.</p></section>
  </div></main>;
}
