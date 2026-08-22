import { getOwnProfile } from "@/data/me";
import { requireServerSession } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ContactsPage() {
  const session = await requireServerSession();
  const profile = await getOwnProfile(session.user.id);
  const result = profile
    ? await createAdminClient().from("contact_events").select("channel, created_at").eq("profile_id", profile.profile.id).order("created_at", { ascending: false }).limit(500)
    : { data: [], error: null };
  if (result.error) throw result.error;
  const grouped = new Map<string, { day: string; channel: string; total: number }>();
  for (const event of result.data ?? []) {
    const day = event.created_at.slice(0, 10);
    const key = `${day}-${event.channel}`;
    const current = grouped.get(key) ?? { day, channel: event.channel, total: 0 };
    current.total += 1;
    grouped.set(key, current);
  }
  const rows = [...grouped.values()].slice(0, 30);
  return <><h2 className="text-2xl font-semibold">Contactos</h2><p className="mt-2 text-sm text-[var(--muted)]">Métricas agregadas; no mostramos identidad ni IP de visitantes.</p><div className="mt-7 grid gap-3">{rows.length ? rows.map((row) => <div key={`${row.day}-${row.channel}`} className="flex items-center justify-between rounded-2xl border border-[var(--line)] p-4"><div><p className="font-semibold capitalize">{row.channel}</p><p className="mt-1 text-xs text-[var(--muted)]">{new Date(`${row.day}T12:00:00`).toLocaleDateString("es-AR")}</p></div><strong>{row.total}</strong></div>) : <div className="rounded-2xl border border-dashed border-[var(--line)] p-10 text-center text-sm text-[var(--muted)]">Todavía no se registraron contactos.</div>}</div></>;
}
