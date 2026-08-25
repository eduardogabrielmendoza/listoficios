import sharp from "sharp";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import { PUBLIC_PROFESSIONALS_TAG } from "@/data/professionals";
import { requireServerSession } from "@/lib/auth-server";
import type { MediaKind, PortfolioItem } from "@/lib/api-contracts";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { deleteImage, uploadImage } from "@/lib/server/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
const kindSchema = z.enum(["avatar", "cover", "work"]);
const updateSchema = z.object({
  items: z.array(z.object({
    id: z.uuid(),
    sortOrder: z.number().int().min(0).max(20),
    alt: z.string().trim().max(160).optional(),
    caption: z.string().trim().max(180).optional(),
  })).min(1).max(6),
});

type MediaRow = {
  id: string;
  alt: string;
  caption?: string | null;
  kind?: MediaKind;
  sort_order: number;
  focal_x?: number | null;
  focal_y?: number | null;
  width: number;
  height: number;
};

function mediaItem(item: MediaRow): PortfolioItem {
  const kind = item.kind ?? "work";
  return {
    id: item.id,
    url: `/media/${item.id}?variant=${kind === "work" ? "gallery" : kind}`,
    alt: item.alt,
    caption: item.caption ?? "",
    kind,
    sortOrder: item.sort_order,
    focalX: Number(item.focal_x ?? 0.5),
    focalY: Number(item.focal_y ?? 0.5),
    width: item.width,
    height: item.height,
  };
}

async function owner() {
  const session = await requireServerSession();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("professional_profiles")
    .select("id")
    .eq("user_id", session.user.id)
    .maybeSingle();
  if (error) throw error;
  return { profile: data, supabase, userId: session.user.id };
}

export async function POST(request: Request) {
  const id = requestId(request);
  let access: Awaited<ReturnType<typeof owner>>;
  try { access = await owner(); } catch { return apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, id); }
  if (!access.profile) return apiError("PROFILE_REQUIRED", "Primero creá tu perfil profesional.", 422, id);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const parsedKind = kindSchema.safeParse(form?.get("kind") ?? "work");
  if (!(file instanceof File)) return apiError("FILE_REQUIRED", "Seleccioná una imagen.", 422, id);
  if (!parsedKind.success) return apiError("INVALID_KIND", "El tipo de imagen no es válido.", 422, id);
  if (file.size > 5 * 1024 * 1024 || !allowed.has(file.type)) return apiError("INVALID_FILE", "Usá JPEG, PNG o WebP de hasta 5 MB.", 422, id);

  const kind = parsedKind.data;
  const existing = await access.supabase
    .from("portfolio_items")
    .select("id, storage_key")
    .eq("profile_id", access.profile.id)
    .eq("kind", kind)
    .order("sort_order");
  if (existing.error) return apiError("MEDIA_ERROR", "No pudimos consultar tus imágenes. Ejecutá primero la migración de medios.", 503, id);
  if (kind === "work" && (existing.data?.length ?? 0) >= 6) return apiError("MEDIA_LIMIT", "Podés publicar hasta seis trabajos.", 422, id);

  let storedPublicId: string | null = null;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(input).metadata();
    if (!metadata.width || !metadata.height || !metadata.format) return apiError("INVALID_IMAGE", "El archivo no contiene una imagen válida.", 422, id);
    const output = await sharp(input).rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer({ resolveWithObject: true });
    const stored = await uploadImage(output.data, `listoficios/profiles/${access.profile.id}`);
    storedPublicId = stored.publicId;
    const values = {
      storage_key: stored.publicId,
      alt: String(form?.get("alt") ?? "").slice(0, 160),
      caption: String(form?.get("caption") ?? "").slice(0, 180),
      kind,
      width: stored.width,
      height: stored.height,
      focal_x: 0.5,
      focal_y: 0.5,
      updated_at: new Date().toISOString(),
    };
    const previous = kind === "work" ? null : existing.data?.[0] ?? null;
    const pending = await access.supabase.from("media_submissions").insert({
      profile_id: access.profile.id, user_id: access.userId, kind, storage_key: stored.publicId,
      alt: values.alt, caption: values.caption, width: stored.width, height: stored.height,
      replaces_item_id: previous?.id ?? null,
    }).select("id, status").single();
    if (!pending.error) {
      storedPublicId = null;
      return apiData({ id: pending.data.id, status: "pending", message: "La imagen quedó pendiente de revisión." }, { requestId: id }, { status: 202 });
    }
    if (!pending.error.message.includes("media_submissions") && pending.error.code !== "PGRST205" && pending.error.code !== "42P01") throw pending.error;
    const saved = previous
      ? await access.supabase.from("portfolio_items").update(values).eq("id", previous.id).select().single()
      : await access.supabase.from("portfolio_items").insert({ ...values, profile_id: access.profile.id, sort_order: kind === "work" ? existing.data?.length ?? 0 : 0 }).select().single();
    if (saved.error) throw saved.error;
    if (previous) await deleteImage(previous.storage_key).catch(() => undefined);
    revalidateTag(PUBLIC_PROFESSIONALS_TAG, "max");
    return apiData(mediaItem(saved.data as MediaRow), { requestId: id });
  } catch (error) {
    if (storedPublicId) await deleteImage(storedPublicId).catch(() => undefined);
    const missing = error instanceof Error && error.message === "CLOUDINARY_NOT_CONFIGURED";
    return apiError(missing ? "CLOUDINARY_NOT_CONFIGURED" : "MEDIA_ERROR", missing ? "Cloudinary todavía no está configurado." : "No pudimos procesar la imagen.", 503, id);
  }
}

export async function PATCH(request: Request) {
  const id = requestId(request);
  let access: Awaited<ReturnType<typeof owner>>;
  try { access = await owner(); } catch { return apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, id); }
  if (!access.profile) return apiError("NOT_FOUND", "No encontramos la galería.", 404, id);
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_MEDIA", "Revisá los datos de las imágenes.", 422, id);
  const ids = parsed.data.items.map((item) => item.id);
  const owned = await access.supabase.from("portfolio_items").select("id").eq("profile_id", access.profile.id).in("id", ids);
  if (owned.error || owned.data?.length !== ids.length) return apiError("NOT_FOUND", "No encontramos una de las imágenes.", 404, id);
  const updates = await Promise.all(parsed.data.items.map((item) => access.supabase
    .from("portfolio_items")
    .update({ sort_order: item.sortOrder, ...(item.alt !== undefined ? { alt: item.alt } : {}), ...(item.caption !== undefined ? { caption: item.caption } : {}), updated_at: new Date().toISOString() })
    .eq("id", item.id)
    .eq("profile_id", access.profile!.id)));
  if (updates.some((result) => result.error)) return apiError("MEDIA_ERROR", "No pudimos ordenar la galería.", 503, id);
  revalidateTag(PUBLIC_PROFESSIONALS_TAG, "max");
  return apiData({ updated: true }, { requestId: id });
}

export async function DELETE(request: Request) {
  const id = requestId(request);
  let access: Awaited<ReturnType<typeof owner>>;
  try { access = await owner(); } catch { return apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, id); }
  if (!access.profile) return apiError("NOT_FOUND", "No encontramos la imagen.", 404, id);
  const parsed = z.object({ id: z.uuid() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_ID", "Imagen inválida.", 400, id);
  const row = await access.supabase.from("portfolio_items").select("id, storage_key").eq("id", parsed.data.id).eq("profile_id", access.profile.id).maybeSingle();
  if (row.error || !row.data) return apiError("NOT_FOUND", "No encontramos la imagen.", 404, id);
  try {
    const deleted = await access.supabase.from("portfolio_items").delete().eq("id", row.data.id);
    if (deleted.error) throw deleted.error;
    await deleteImage(row.data.storage_key).catch(() => undefined);
    revalidateTag(PUBLIC_PROFESSIONALS_TAG, "max");
    return apiData({ deleted: true }, { requestId: id });
  } catch {
    return apiError("MEDIA_ERROR", "No pudimos borrar la imagen.", 503, id);
  }
}
