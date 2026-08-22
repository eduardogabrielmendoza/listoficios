import sharp from "sharp";
import { z } from "zod";
import { requireServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { deleteImage, uploadImage } from "@/lib/server/storage";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

async function owner() {
  const session = await requireServerSession();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("professional_profiles").select("id").eq("user_id", session.user.id).maybeSingle();
  if (error) throw error;
  return { session, profile: data, supabase };
}

export async function POST(request: Request) {
  const id = requestId(request);
  let access;
  try { access = await owner(); } catch { return apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, id); }
  if (!access.profile) return apiError("PROFILE_REQUIRED", "Primero creá tu perfil profesional.", 422, id);
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return apiError("FILE_REQUIRED", "Seleccioná una imagen.", 422, id);
  if (file.size > 5 * 1024 * 1024 || !allowed.has(file.type)) return apiError("INVALID_FILE", "Usá JPEG, PNG o WebP de hasta 5 MB.", 422, id);
  const count = await access.supabase.from("portfolio_items").select("id", { count: "exact", head: true }).eq("profile_id", access.profile.id);
  if (count.error) return apiError("MEDIA_ERROR", "No pudimos consultar la galería.", 503, id);
  if ((count.count ?? 0) >= 6) return apiError("MEDIA_LIMIT", "Podés publicar hasta seis imágenes.", 422, id);
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(input).metadata();
    if (!metadata.width || !metadata.height || !metadata.format) return apiError("INVALID_IMAGE", "El archivo no contiene una imagen válida.", 422, id);
    const output = await sharp(input).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const stored = await uploadImage(output.data, `listoficios/profiles/${access.profile.id}`);
    const inserted = await access.supabase.from("portfolio_items").insert({
      profile_id: access.profile.id,
      storage_key: stored.publicId,
      alt: String(form?.get("alt") ?? "").slice(0, 160),
      width: stored.width,
      height: stored.height,
      sort_order: count.count ?? 0,
    }).select().single();
    if (inserted.error) {
      await deleteImage(stored.publicId).catch(() => undefined);
      throw inserted.error;
    }
    const item = inserted.data;
    return apiData({ id: item.id, url: `/media/${item.id}`, alt: item.alt, width: item.width, height: item.height }, { requestId: id });
  } catch (error) {
    const missing = error instanceof Error && error.message === "CLOUDINARY_NOT_CONFIGURED";
    return apiError(missing ? "CLOUDINARY_NOT_CONFIGURED" : "MEDIA_ERROR", missing ? "Cloudinary todavía no está configurado." : "No pudimos procesar la imagen.", 503, id);
  }
}

export async function DELETE(request: Request) {
  const id = requestId(request);
  let access;
  try { access = await owner(); } catch { return apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, id); }
  if (!access.profile) return apiError("NOT_FOUND", "No encontramos la imagen.", 404, id);
  const parsed = z.object({ id: z.uuid() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_ID", "Imagen inválida.", 400, id);
  const row = await access.supabase.from("portfolio_items").select("id, storage_key").eq("id", parsed.data.id).eq("profile_id", access.profile.id).maybeSingle();
  if (row.error || !row.data) return apiError("NOT_FOUND", "No encontramos la imagen.", 404, id);
  try {
    await deleteImage(row.data.storage_key);
    const deleted = await access.supabase.from("portfolio_items").delete().eq("id", row.data.id);
    if (deleted.error) throw deleted.error;
    return apiData({ deleted: true }, { requestId: id });
  } catch {
    return apiError("MEDIA_ERROR", "No pudimos borrar la imagen.", 503, id);
  }
}
