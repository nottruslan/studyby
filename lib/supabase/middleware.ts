import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnvOptional } from "./env";

function redirectWithCookies(
  url: URL,
  sourceResponse: NextResponse
): NextResponse {
  const res = NextResponse.redirect(url);
  sourceResponse.cookies.getAll().forEach((cookie) => {
    res.cookies.set(cookie.name, cookie.value, cookie);
  });
  return res;
}

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone();
  const isAuthCallback = url.pathname.startsWith("/auth/callback");
  const isOnboarding = url.pathname === "/onboarding";
  const isLogin = url.pathname === "/login";

  const env = getSupabaseEnvOptional();

  if (!env) {
    if (!isOnboarding && !isLogin && !isAuthCallback) {
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAuthCallback) {
    return supabaseResponse;
  }

  if (!user && !isOnboarding && !isLogin) {
    url.pathname = "/onboarding";
    return redirectWithCookies(url, supabaseResponse);
  }

  if (user && (isOnboarding || isLogin)) {
    url.pathname = "/feed";
    return redirectWithCookies(url, supabaseResponse);
  }

  return supabaseResponse;
}
