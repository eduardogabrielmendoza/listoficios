import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublicIsConfigured, supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";

export async function refreshSupabaseSession(request: NextRequest) {
  if (!supabasePublicIsConfigured()) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}
