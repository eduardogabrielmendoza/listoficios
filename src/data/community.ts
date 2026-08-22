import { createAdminClient } from "@/lib/supabase/admin";
import type { NotificationRow, ReviewRow } from "@/lib/supabase/rows";

export async function saveReview(userId: string, input: { id?: string; profileId: string; rating: number; title: string; body: string }) {
  const supabase = createAdminClient();
  const [contact, profileResult] = await Promise.all([
    supabase.from("contact_events").select("id").eq("user_id", userId).eq("profile_id", input.profileId).limit(1),
    supabase.from("professional_profiles").select("user_id").eq("id", input.profileId).maybeSingle(),
  ]);
  if (contact.error || !contact.data?.length) throw new Error("CONTACT_REQUIRED");
  if (profileResult.error || !profileResult.data || profileResult.data.user_id === userId) throw new Error("NOT_ALLOWED");
  const now = new Date().toISOString();
  const { data, error } = await supabase.from("reviews").upsert({
    user_id: userId,
    profile_id: input.profileId,
    rating: input.rating,
    title: input.title,
    body: input.body,
    status: "pending",
    moderation_note: null,
    updated_at: now,
  }, { onConflict: "user_id,profile_id" }).select().single();
  if (error) throw error;
  if (profileResult.data.user_id) {
    const notification = await supabase.from("notifications").insert({
      user_id: profileResult.data.user_id,
      kind: "review",
      title: "Recibiste una nueva opinión",
      body: "La opinión está pendiente de moderación.",
      href: "/panel/opiniones",
    });
    if (notification.error) throw notification.error;
  }
  return data as unknown as ReviewRow;
}

export async function replyToReview(userId: string, reviewId: string, body: string) {
  const supabase = createAdminClient();
  const { data: review, error } = await supabase
    .from("reviews")
    .select("id, profile_id, professional_profiles!inner(user_id)")
    .eq("id", reviewId)
    .eq("professional_profiles.user_id", userId)
    .maybeSingle();
  if (error || !review) throw new Error("NOT_FOUND");
  const result = await supabase.from("review_replies").upsert({
    review_id: reviewId,
    profile_id: review.profile_id,
    body,
    updated_at: new Date().toISOString(),
  }, { onConflict: "review_id" }).select().single();
  if (result.error) throw result.error;
  return result.data;
}

export async function createReport(input: { reporterUserId?: string; targetType: "profile" | "service" | "review"; targetId: string; reason: string; description: string; visitorHash: string }) {
  const { data, error } = await createAdminClient().from("reports").insert({
    reporter_user_id: input.reporterUserId ?? null,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    description: input.description,
    visitor_hash: input.visitorHash,
  }).select("id, status").single();
  if (error) throw error;
  return { number: `REP-${data.id.slice(0, 8).toUpperCase()}`, status: data.status };
}

export async function createSupport(input: { userId?: string; name: string; email: string; userType: string; topic: string; message: string }) {
  const number = `LF-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
  const { data, error } = await createAdminClient().from("support_tickets").insert({
    number,
    user_id: input.userId ?? null,
    name: input.name,
    email: input.email,
    user_type: input.userType,
    topic: input.topic,
    message: input.message,
  }).select("number, status, created_at").single();
  if (error) throw error;
  return { number: data.number, status: data.status, createdAt: new Date(data.created_at) };
}

export async function listNotifications(userId: string) {
  const { data, error } = await createAdminClient().from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return ((data ?? []) as unknown as NotificationRow[]).map((item) => ({
    id: item.id,
    userId: item.user_id,
    kind: item.kind,
    title: item.title,
    body: item.body,
    href: item.href,
    readAt: item.read_at ? new Date(item.read_at) : null,
    createdAt: new Date(item.created_at),
  }));
}

export async function markNotifications(userId: string, read: boolean) {
  const { error } = await createAdminClient().from("notifications").update({ read_at: read ? new Date().toISOString() : null }).eq("user_id", userId);
  if (error) throw error;
  return { updated: true };
}

export async function recordProfileView(profileId: string) {
  const { error } = await createAdminClient().rpc("increment_profile_view", { p_profile_id: profileId });
  if (error) throw error;
}

export async function professionalAnalytics(userId: string) {
  const supabase = createAdminClient();
  const profile = await supabase.from("professional_profiles").select("id").eq("user_id", userId).maybeSingle();
  if (profile.error) throw profile.error;
  if (!profile.data) return [];
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data, error } = await supabase.from("profile_daily_stats").select("*").eq("profile_id", profile.data.id).gte("day", since.toISOString().slice(0, 10)).order("day");
  if (error) throw error;
  return (data ?? []).map((entry) => ({ profileId: entry.profile_id, day: entry.day, views: entry.views, contacts: entry.contacts, favorites: entry.favorites }));
}
