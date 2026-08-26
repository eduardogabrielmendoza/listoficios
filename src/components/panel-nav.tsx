"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/panel", "Resumen"], ["/panel/publicacion", "Mi publicación"], ["/panel/servicios", "Servicios"],
  ["/panel/galeria", "Galería"], ["/panel/opiniones", "Opiniones"], ["/panel/favoritos", "Favoritos"],
  ["/panel/contactos", "Contactos"], ["/panel/notificaciones", "Avisos"], ["/panel/cuenta", "Cuenta"],
] as const;

export function PanelNav() {
  const pathname = usePathname();
  return <nav className="grid grid-cols-2 gap-2 rounded-[22px] border border-[var(--line)] bg-white p-2 sm:grid-cols-3 lg:grid-cols-1 lg:self-start" aria-label="Mi panel">
    {items.map(([href, label]) => <Link key={href} href={href} className={`min-w-0 rounded-2xl px-3 py-3 text-center text-sm font-medium lg:text-left ${pathname === href ? "bg-[var(--ink)] text-white" : "text-[var(--muted)] hover:bg-[var(--paper)]"}`}>{label}</Link>)}
  </nav>;
}
