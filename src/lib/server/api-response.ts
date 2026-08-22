import { NextResponse } from "next/server";
import type { ApiError, ApiFieldErrors, ApiMeta, ApiResponse } from "@/lib/api-contracts";

export function requestId(request?: Request) {
  return request?.headers.get("x-request-id")?.slice(0, 100) || crypto.randomUUID();
}

export function apiData<T>(data: T, meta?: ApiMeta, init?: ResponseInit) {
  return NextResponse.json<ApiResponse<T>>({ data, ...(meta ? { meta } : {}) }, init);
}

export function apiError(code: string, message: string, status: number, id: string, fieldErrors?: ApiFieldErrors) {
  return NextResponse.json<ApiError>({ error: { code, message, ...(fieldErrors ? { fieldErrors } : {}), requestId: id } }, { status });
}

export function logRequest(level: "info" | "warn" | "error", event: string, details: Record<string, unknown>) {
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...details });
  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}
