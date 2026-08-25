import { notFound } from "next/navigation";
import { AdminSectionView } from "@/components/admin-section";
import { ModerationQueue } from "@/components/moderation-queue";
import { SiteConfigEditor } from "@/components/site-config-editor";
import { MediaReviewQueue } from "@/components/media-review-queue";
import { TeamManager } from "@/components/team-manager";
import { listAdminSection, type AdminSection } from "@/data/admin-console";

const copy: Record<AdminSection, [string, string]> = {
  moderacion: ["Cola de moderación", "Contenido que necesita una decisión humana, con reglas activadas e historial."],
  perfiles: ["Perfiles y servicios", "Revisá publicaciones, estados y correcciones controladas."],
  opiniones: ["Opiniones", "Moderá opiniones de usuarios y respuestas profesionales."],
  reportes: ["Reportes", "Investigá denuncias sin exponer información privada."],
  imagenes: ["Imágenes", "Aprobá avatares, portadas y trabajos antes de publicarlos."],
  soporte: ["Centro de soporte", "Organizá consultas, notas internas y respuestas pendientes."],
  usuarios: ["Usuarios", "Administrá cuentas y bloqueos con trazabilidad completa."],
  catalogos: ["Categorías y zonas", "Ordená el catálogo visible sin admitir iconos arbitrarios."],
  contenido: ["Configuración visual", "Gestioná borradores, publicaciones y restauraciones del sitio."],
  equipo: ["Equipo y permisos", "Asigná roles de moderador o administrador."],
  auditoria: ["Auditoría", "Consultá quién cambió qué, cuándo y por qué."],
};

export default async function AdminSectionPage({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<{ q?: string }> }) {
  const section = (await params).section as AdminSection;
  if (!(section in copy)) notFound();
  const query = (await searchParams).q ?? "";
  const result = await listAdminSection(section, query);
  if (section === "contenido") return <main className="p-4 sm:p-7 lg:p-9"><div className="mx-auto max-w-[1180px]"><p className="section-kicker">CMS controlado</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Configuración visual</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Editá el borrador, comprobá la vista previa y publicá una versión inmutable.</p><SiteConfigEditor/></div></main>;
  if (section === "moderacion" && !result.unavailable) return <main className="p-4 sm:p-7 lg:p-9"><div className="mx-auto max-w-[1180px]"><p className="section-kicker">Revisión humana</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Cola de moderación</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Compará el contenido y dejá un motivo claro. Cada decisión queda auditada.</p><ModerationQueue initialRows={result.rows}/></div></main>;
  if (section === "imagenes" && !result.unavailable) return <main className="p-4 sm:p-7 lg:p-9"><div className="mx-auto max-w-[1180px]"><p className="section-kicker">Revisión visual</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Imágenes pendientes</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Las imágenes nuevas no aparecen públicamente hasta ser aprobadas.</p><MediaReviewQueue initialRows={result.rows}/></div></main>;
  if (section === "equipo" && !result.unavailable) return <main className="p-4 sm:p-7 lg:p-9"><div className="mx-auto max-w-[1180px]"><p className="section-kicker">Acceso interno</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Equipo y permisos</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">Asigná el mínimo acceso necesario. Los moderadores no pueden editar el CMS ni cambiar roles.</p><TeamManager initialRows={result.rows}/></div></main>;
  return <AdminSectionView title={copy[section][0]} description={copy[section][1]} rows={result.rows} unavailable={result.unavailable} query={query}/>;
}
