"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth-provider";
import { Brand } from "@/components/brand";
import { useScrollLock } from "@/components/global-scroll-provider";
import { Icon } from "@/components/icons";

const links = [
  ["Buscar profesionales", "/profesionales"],
  ["Explorar servicios", "/servicios"],
  ["Buscar por zona", "/zonas"],
  ["Cómo funciona", "/como-funciona"],
  ["Centro de ayuda", "/ayuda"],
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { session, logout } = useAuth();
  useScrollLock(open);

  const close = () => setOpen(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-white lg:hidden"
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        <Icon name="menu" className="size-5" />
      </button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <button className="absolute inset-0 bg-[rgba(9,32,28,.38)] backdrop-blur-sm" onClick={close} aria-label="Cerrar menú" />
            <aside data-scroll-native className="absolute right-0 top-0 flex h-full w-[min(88vw,360px)] flex-col overflow-y-auto overscroll-contain bg-[var(--paper)] p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <Brand />
                <button onClick={close} className="grid size-10 place-items-center rounded-full border border-[var(--line)] bg-white" aria-label="Cerrar menú">
                  <Icon name="x" className="size-5" />
                </button>
              </div>
              <nav className="mt-10 flex flex-col gap-1 text-lg font-semibold">
                {links.map(([label, href]) => (
                  <Link key={href} href={href} onClick={close} className="rounded-2xl px-4 py-3 hover:bg-white">
                    {label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto grid gap-3">
                {session ? (
                  <>
                    <Link href="/panel" onClick={close} className="grid h-12 place-items-center rounded-full border border-[var(--ink)] font-semibold">
                      Mi panel
                    </Link>
                    <button
                      onClick={async () => {
                        await logout();
                        close();
                      }}
                      className="h-12 rounded-full text-sm font-semibold"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link href="/ingresar" onClick={close} className="grid h-12 place-items-center rounded-full border border-[var(--ink)] font-semibold">
                    Ingresar
                  </Link>
                )}
                <Link
                  href={session ? "/profesionales/crear-perfil" : "/crear-cuenta?next=/profesionales/crear-perfil"}
                  onClick={close}
                  className="grid h-12 place-items-center rounded-full bg-[var(--ink)] font-semibold text-white"
                >
                  Publicar mi servicio
                </Link>
              </div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
