import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getImageUrl } from "@/lib/server/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) { const result = await createAdminClient().from("site_assets").select("storage_key").eq("id", (await params).id).maybeSingle(); if (result.error || !result.data) return new NextResponse(null, { status: 404 }); return NextResponse.redirect(getImageUrl(result.data.storage_key, "full"), 307); }
