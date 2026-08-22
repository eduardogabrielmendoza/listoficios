import { requireServerSession } from "@/lib/auth-server";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function ReviewsPage() {
  const session = await requireServerSession();
  const { data, error } = await createAdminClient()
    .from("reviews")
    .select("id, title, body, rating, status, created_at, professional_profiles!inner(user_id), user_profiles!reviews_user_id_fkey(name)")
    .eq("professional_profiles.user_id", session.user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  return <><h2 className="text-2xl font-semibold">Opiniones</h2><p className="mt-2 text-sm text-[var(--muted)]">Opiniones de usuarios y estado de moderación.</p><div className="mt-7 grid gap-3">{rows.length ? rows.map((review) => { const author = review.user_profiles as unknown as { name: string }; return <article key={review.id} className="rounded-2xl border border-[var(--line)] p-5"><div className="flex justify-between gap-4"><p className="font-semibold">{review.rating}/5 · {review.title}</p><span className="text-xs capitalize text-[var(--muted)]">{review.status}</span></div><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{review.body}</p><p className="mt-3 text-xs">Por {author.name} · {new Date(review.created_at).toLocaleDateString("es-AR")}</p></article>; }) : <Empty text="Todavía no recibiste opiniones." />}</div></>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-[var(--line)] p-10 text-center text-sm text-[var(--muted)]">{text}</div>;
}
