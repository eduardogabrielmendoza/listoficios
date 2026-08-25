import Link from "next/link";
import { Icon } from "@/components/icons";
import type { AdminListRow } from "@/data/admin-console";

const preferred = ["display_name", "name", "email", "title", "topic", "reason", "target_type", "status", "moderation_status", "role", "created_at"];

function value(row: AdminListRow, key: string) {
  const item = row[key];
  if (typeof item === "string") return key.endsWith("_at") ? new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(item)) : item;
  if (typeof item === "number" || typeof item === "boolean") return String(item);
  return "—";
}

export function AdminSectionView({ title, description, rows, unavailable, query = "" }: { title: string; description: string; rows: AdminListRow[]; unavailable: boolean; query?: string }) {
  const columns = preferred.filter((key) => rows.some((row) => row[key] !== undefined)).slice(0, 5);
  return <main className="p-4 sm:p-7 lg:p-9"><div className="mx-auto max-w-[1180px]">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-kicker">Centro operativo</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{description}</p></div></div>
    <form className="mt-7 flex max-w-xl gap-2"><label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-[var(--line)] bg-white px-3"><Icon name="search" className="size-4 text-[var(--muted)]"/><span className="sr-only">Buscar</span><input name="q" defaultValue={query} placeholder="Buscar en esta sección" className="min-w-0 flex-1 bg-transparent text-sm outline-none"/></label><button className="primary-button !min-h-11">Buscar</button></form>
    <div data-scroll-native className="mt-6 overflow-hidden rounded-[22px] border border-[var(--line)] bg-white">
      {unavailable ? <Empty title="Ejecutá la migración 0002" text="Esta sección quedará disponible cuando las nuevas tablas estén instaladas en Supabase."/> : rows.length === 0 ? <Empty title="Todo al día" text="No hay elementos para mostrar con los filtros actuales."/> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#f5f8f6] text-xs uppercase tracking-[.08em] text-[var(--muted)]"><tr>{columns.map((column) => <th key={column} className="px-5 py-4 font-medium">{column.replaceAll("_", " ")}</th>)}<th className="px-5 py-4"><span className="sr-only">Acciones</span></th></tr></thead><tbody className="divide-y divide-[var(--line)]">{rows.map((row, index) => <tr key={String(row.id ?? index)} className="hover:bg-[#fafcfb]">{columns.map((column) => <td key={column} className="max-w-[280px] truncate px-5 py-4">{value(row, column)}</td>)}<td className="px-5 py-4 text-right"><Link href="#detalle" className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--line)] px-3 text-xs font-semibold">Revisar <Icon name="arrow-right" className="size-3.5"/></Link></td></tr>)}</tbody></table></div>}
    </div>
  </div></main>;
}

function Empty({ title, text }: { title: string; text: string }) { return <div className="grid min-h-64 place-items-center p-8 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-full bg-[#edf4f1] text-[var(--brand)]"><Icon name="check" className="size-5"/></span><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-2 max-w-md text-sm text-[var(--muted)]">{text}</p></div></div>; }
