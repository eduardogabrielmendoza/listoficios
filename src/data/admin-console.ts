import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseIsConfigured } from "@/lib/supabase/config";

export type AdminListRow = Record<string, unknown>;

const sources = {
  moderacion: { table: "moderation_cases", order: "created_at" },
  perfiles: { table: "professional_profiles", order: "updated_at" },
  opiniones: { table: "reviews", order: "created_at" },
  reportes: { table: "reports", order: "created_at" },
  imagenes: { table: "media_submissions", order: "created_at" },
  soporte: { table: "support_tickets", order: "created_at" },
  usuarios: { table: "user_profiles", order: "created_at" },
  catalogos: { table: "categories", order: "sort_order" },
  contenido: { table: "site_config_versions", order: "created_at" },
  equipo: { table: "user_profiles", order: "updated_at" },
  auditoria: { table: "moderation_actions", order: "created_at" },
} as const;

export type AdminSection = keyof typeof sources;

export async function listAdminSection(section: AdminSection, query = "") {
  if (!supabaseIsConfigured()) return { rows: [] as AdminListRow[], unavailable: true, message: "Supabase no está configurado." };
  const source = sources[section];
  let request = createAdminClient().from(source.table).select("*").order(source.order, { ascending: false }).limit(50);
  if (query.trim()) {
    const term = query.trim().replace(/[,%()]/g, "");
    const columns = section === "usuarios" || section === "equipo" ? "name,email" : section === "perfiles" ? "display_name,headline,slug" : section === "soporte" ? "name,email,topic,message" : section === "opiniones" ? "title,body,status" : section === "reportes" ? "reason,description,status" : section === "imagenes" ? "alt,caption,kind,status" : section === "moderacion" ? "target_type,priority,status" : section === "auditoria" ? "target_type,action,reason" : "name,description";
    request = request.or(columns.split(",").map((column) => `${column}.ilike.%${term}%`).join(","));
  }
  const { data, error } = await request;
  if (error) return { rows: [] as AdminListRow[], unavailable: true, message: error.message };
  return { rows: (data ?? []) as AdminListRow[], unavailable: false, message: "" };
}

export async function adminOperationalOverview() {
  if (!supabaseIsConfigured()) return { moderation: 0, images: 0, reviews: 0, reports: 0, support: 0, suspended: 0 };
  const supabase = createAdminClient();
  const specs = [
    ["moderation_cases", "status", "open"], ["media_submissions", "status", "pending"],
    ["reviews", "status", "pending"], ["reports", "status", "open"],
    ["support_tickets", "status", "open"], ["professional_profiles", "status", "suspended"],
  ] as const;
  const results = await Promise.all(specs.map(async ([table, field, value]) => {
    const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true }).eq(field, value);
    return error ? 0 : count ?? 0;
  }));
  return { moderation: results[0], images: results[1], reviews: results[2], reports: results[3], support: results[4], suspended: results[5] };
}
