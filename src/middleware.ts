import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Guard: if Supabase env vars are missing, pass through
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  try {
    return await handleRouteProtection(request, supabaseUrl, supabaseAnonKey);
  } catch {
    // If anything fails, pass the request through rather than crash
    return response;
  }
}

async function handleRouteProtection(
  request: NextRequest,
  supabaseUrl: string,
  supabaseAnonKey: string
) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  // Only check auth + profile for routes that need protection
  const protectedPrefixes = ["/login", "/signup", "/onboarding", "/create"];
  const needsAuthCheck = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (!needsAuthCheck) {
    // Public route — just refresh the session without blocking
    await supabase.auth.getUser();
    return supabaseResponse;
  }

  // Protected route — check auth and onboarding status
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isOnboarded = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_onboarded")
      .eq("id", user.id)
      .single();

    isOnboarded = profile?.is_onboarded ?? false;
  }

  // /login and /signup — if authenticated and onboarded, redirect to /
  if (pathname === "/login" || pathname === "/signup") {
    if (user && isOnboarded) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // /onboarding — only accessible if authenticated AND not yet onboarded
  if (pathname === "/onboarding") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (isOnboarded) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // /create/* — only accessible if authenticated AND onboarded
  if (pathname.startsWith("/create")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    if (!isOnboarded) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
