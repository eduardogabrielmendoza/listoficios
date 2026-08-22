import { and, eq, sql } from "drizzle-orm";
import sharp from "sharp";
import { z } from "zod";
import { getDb } from "@/db";
import { portfolioItems, professionalProfiles } from "@/db/schema";
import { requireServerSession } from "@/lib/auth-server";
import { apiData, apiError, requestId } from "@/lib/server/api-response";
import { deleteImage, uploadImage } from "@/lib/server/storage";

export const runtime = "nodejs";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

async function owner() {
  const session = await requireServerSession();
  const db = getDb();
  const profiles = await db
    .select()
    .from(professionalProfiles)
    .where(eq(professionalProfiles.userId, session.user.id))
    .limit(1);
  return { session, profile: profiles[0] };
}

export async function POST(request: Request) {
  const id = requestId(request);
  let access;
  try {
    access = await owner();
  } catch {
    return apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, id);
  }

  if (!access.profile) return apiError("PROFILE_REQUIRED", "Primero creá tu perfil profesional.", 422, id);

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return apiError("FILE_REQUIRED", "Seleccioná una imagen.", 422, id);
  if (file.size > 5 * 1024 * 1024 || !allowed.has(file.type)) {
    return apiError("INVALID_FILE", "Usá JPEG, PNG o WebP de hasta 5 MB.", 422, id);
  }

  const db = getDb();
  const count = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(portfolioItems)
    .where(eq(portfolioItems.profileId, access.profile.id));
  if ((count[0]?.value ?? 0) >= 6) return apiError("MEDIA_LIMIT", "Podés publicar hasta seis imágenes.", 422, id);

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(input).metadata();
    if (!metadata.width || !metadata.height || !metadata.format) {
      return apiError("INVALID_IMAGE", "El archivo no contiene una imagen válida.", 422, id);
    }

    const output = await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    const stored = await uploadImage(output.data, `listoficios/profiles/${access.profile.id}`);
    const [item] = await db
      .insert(portfolioItems)
      .values({
        profileId: access.profile.id,
        storageKey: stored.publicId,
        alt: String(form?.get("alt") ?? "").slice(0, 160),
        width: stored.width,
        height: stored.height,
        sortOrder: count[0]?.value ?? 0,
      })
      .returning();

    return apiData(
      { id: item.id, url: `/media/${item.id}`, alt: item.alt, width: item.width, height: item.height },
      { requestId: id },
    );
  } catch (error) {
    const missing = error instanceof Error && error.message === "CLOUDINARY_NOT_CONFIGURED";
    return apiError(
      missing ? "CLOUDINARY_NOT_CONFIGURED" : "MEDIA_ERROR",
      missing ? "Cloudinary todavía no está configurado." : "No pudimos procesar la imagen.",
      503,
      id,
    );
  }
}

export async function DELETE(request: Request) {
  const id = requestId(request);
  let access;
  try {
    access = await owner();
  } catch {
    return apiError("UNAUTHORIZED", "Necesitás ingresar.", 401, id);
  }

  if (!access.profile) return apiError("NOT_FOUND", "No encontramos la imagen.", 404, id);
  const parsed = z.object({ id: z.uuid() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("INVALID_ID", "Imagen inválida.", 400, id);

  const db = getDb();
  const rows = await db
    .select()
    .from(portfolioItems)
    .where(and(eq(portfolioItems.id, parsed.data.id), eq(portfolioItems.profileId, access.profile.id)))
    .limit(1);
  if (!rows.length) return apiError("NOT_FOUND", "No encontramos la imagen.", 404, id);

  try {
    await deleteImage(rows[0].storageKey);
    await db.delete(portfolioItems).where(eq(portfolioItems.id, rows[0].id));
    return apiData({ deleted: true }, { requestId: id });
  } catch {
    return apiError("MEDIA_ERROR", "No pudimos borrar la imagen.", 503, id);
  }
}
