import Link from "next/link";
import { PublicationControls } from "@/components/publication-controls";
import { getOwnProfile } from "@/data/me";
import { requireServerSession } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function PublicationPage() {
  const session = await requireServerSession();
  const data = await getOwnProfile(session.user.id);
  if (!data) return <Empty />;
  const gallery = await createAdminClient().from("portfolio_items").select("id", { count: "exact" }).eq("profile_id", data.profile.id);
  if (gallery.error) throw gallery.error;
  const checks = [Boolean(data.profile.bio.length >= 100), data.zones.length > 0, data.services.length > 0, (gallery.count ?? 0) >= 3];
  const completion = Math.round(checks.filter(Boolean).length / checks.length * 100);
  return <><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold">Mi publicación</h2><p className="mt-2 text-sm text-[var(--muted)]">Estado, presentación y nivel de completitud.</p></div><span className="rounded-full bg-[#eaf4f0] px-4 py-2 text-xs font-semibold capitalize text-[var(--brand)]">{data.profile.status}</span></div><div className="mt-7 rounded-[24px] border border-[var(--line)] p-6"><div className="flex items-center justify-between"><p className="font-semibold">Perfil completo</p><strong>{completion}%</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--paper)]"><div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${completion}%` }} /></div><p className="mt-3 text-xs text-[var(--muted)]">Sumá una descripción extensa y tres imágenes para mejorar tu presentación.</p><h3 className="mt-7 text-2xl font-semibold">{data.profile.displayName}</h3><p className="mt-2 text-sm text-[var(--muted)]">{data.profile.headline} · {data.zones.map((zone) => zone.name).join(", ")}</p><div className="mt-6 flex flex-wrap gap-2"><Link href="/profesionales/crear-perfil" className="primary-button">Editar perfil</Link><Link href={`/profesionales/${data.profile.slug}`} className="secondary-button">Vista pública</Link><Link href="/panel/servicios" className="secondary-button">Administrar servicios</Link><PublicationControls status={data.profile.status} /></div></div></>;
}

function Empty() {
  return <div className="rounded-2xl border border-dashed border-[var(--line)] p-10 text-center"><h2 className="text-xl font-semibold">Todavía no tenés una publicación</h2><Link href="/profesionales/crear-perfil" className="primary-button mt-5">Crear perfil</Link></div>;
}
