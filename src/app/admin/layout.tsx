import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";
import { Icon } from "@/components/icons";
import { requireStaffSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session;
  try { session = await requireStaffSession(); }
  catch { redirect("/panel"); }
  return <div className="admin-shell min-h-screen bg-[#f5f7f5]">
    <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[250px_1fr]">
      <aside className="hidden border-r border-[var(--line)] bg-white p-5 lg:block">
        <Link href="/" className="mb-8 flex items-center gap-2 font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-[var(--ink)] text-white">L</span> Listoficios</Link>
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--muted)]">Centro operativo</p>
        <AdminNav role={session.user.role}/>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b border-[var(--line)] bg-white/90 px-4 backdrop-blur-xl sm:px-7">
          <div><p className="text-xs font-semibold uppercase tracking-[.12em] text-[var(--brand)]">Listoficios</p><p className="text-sm text-[var(--muted)]">Administración y moderación</p></div>
          <div className="flex items-center gap-2"><Link href="/admin/moderacion" className="grid size-10 place-items-center rounded-full border border-[var(--line)]" aria-label="Ver alertas"><Icon name="bell" className="size-[18px]"/></Link><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{session.user.name}</p><p className="text-xs capitalize text-[var(--muted)]">{session.user.role}</p></div></div>
        </header>
        <div data-scroll-native className="overflow-x-auto overscroll-contain border-b border-[var(--line)] bg-white px-4 py-2 lg:hidden"><AdminNav role={session.user.role} horizontal/></div>
        {children}
      </div>
    </div>
  </div>;
}
