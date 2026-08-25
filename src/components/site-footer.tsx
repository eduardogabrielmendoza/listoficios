"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useSiteConfig } from "@/components/site-config-provider";

const columns = [
  { title: "Encontrá", links: [["Profesionales", "/profesionales"], ["Servicios", "/servicios"], ["Zonas", "/zonas"], ["Cómo funciona", "/como-funciona"]] },
  { title: "Tu cuenta", links: [["Publicar servicio", "/profesionales/crear-perfil"], ["Mi panel", "/panel"], ["Centro de ayuda", "/ayuda"]] },
  { title: "Listoficios", links: [["Sobre nosotros", "/nosotros"], ["Centro de seguridad", "/seguridad"], ["Privacidad", "/privacidad"], ["Términos", "/terminos"]] },
];

export function SiteFooter() {
  const pathname = usePathname();
  const site = useSiteConfig();
  if (pathname.startsWith("/admin")) return null;
  return <footer className="border-t border-[var(--line)] bg-white px-4 pb-8 pt-14 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1180px]"><div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><Brand/><p className="mt-5 max-w-xs text-sm leading-6 text-[var(--muted)]">{site.brand.description}</p><p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand)]"><Icon name="location" className="size-4"/> Bella Vista, Tucumán</p></div>{columns.map((column) => <div key={column.title}><h3 className="text-sm font-semibold">{column.title}</h3><ul className="mt-4 grid gap-3 text-sm text-[var(--muted)]">{column.links.map(([label, href]) => <li key={href}><Link href={href} className="hover:text-[var(--brand)]">{label}</Link></li>)}</ul></div>)}</div><div className="flex flex-col gap-2 border-t border-[var(--line)] pt-6 text-xs text-[#84908c] sm:flex-row sm:justify-between"><p>© 2026 {site.brand.name}. {site.footer.tagline}</p><p>Sin pagos ni intermediación · Contacto directo</p></div></div></footer>;
}
