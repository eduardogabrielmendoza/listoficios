"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import type { StaffRole } from "@/lib/admin-types";

const items: Array<{ href: string; label: string; icon: IconName; adminOnly?: boolean }> = [
  { href: "/admin", label: "Resumen", icon: "dashboard" },
  { href: "/admin/moderacion", label: "Moderación", icon: "moderation" },
  { href: "/admin/perfiles", label: "Perfiles", icon: "users" },
  { href: "/admin/opiniones", label: "Opiniones", icon: "star" },
  { href: "/admin/reportes", label: "Reportes", icon: "reports" },
  { href: "/admin/imagenes", label: "Imágenes", icon: "images" },
  { href: "/admin/soporte", label: "Soporte", icon: "support" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "user", adminOnly: true },
  { href: "/admin/catalogos", label: "Catálogos", icon: "tag", adminOnly: true },
  { href: "/admin/contenido", label: "Contenido", icon: "settings", adminOnly: true },
  { href: "/admin/equipo", label: "Equipo", icon: "shield", adminOnly: true },
  { href: "/admin/auditoria", label: "Auditoría", icon: "audit", adminOnly: true },
];

export function AdminNav({ role, horizontal = false }: { role: StaffRole; horizontal?: boolean }) {
  const pathname = usePathname();
  return <nav aria-label="Administración" className={horizontal ? "grid grid-cols-2 gap-1.5 sm:grid-cols-3" : "grid gap-1.5"}>
    {items.filter((item) => !item.adminOnly || role === "admin").map((item) => {
      const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
      return <Link key={item.href} href={item.href} className={`flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2 text-xs font-medium transition sm:px-3 sm:text-sm ${active ? "bg-[var(--brand)] text-white" : "text-[#52635d] hover:bg-[#edf3f0] hover:text-[var(--ink)]"}`}>
        <Icon name={item.icon} className="size-[18px] shrink-0"/>{item.label}
      </Link>;
    })}
  </nav>;
}
