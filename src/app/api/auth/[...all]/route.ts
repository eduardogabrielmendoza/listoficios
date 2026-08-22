import { toNextJsHandler } from "better-auth/next-js";
import { auth, authIsConfigured } from "@/lib/auth-server";
import { apiError, requestId } from "@/lib/server/api-response";

export const dynamic = "force-dynamic";

const handlers = toNextJsHandler(auth);

async function configured(request: Request, handler: (request: Request) => Promise<Response>) {
  if (!authIsConfigured()) {
    return apiError("AUTH_NOT_CONFIGURED", "La autenticación necesita las variables de entorno de Railway.", 503, requestId(request));
  }
  return handler(request);
}

export function GET(request: Request) {
  return configured(request, handlers.GET);
}

export function POST(request: Request) {
  return configured(request, handlers.POST);
}
