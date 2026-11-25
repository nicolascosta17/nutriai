import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Preserve the local demo when Supabase is not configured.
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your_supabase_url")) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const protectedRoute = pathname === "/onboarding" || pathname.startsWith("/dashboard");
  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // An upstream outage is not a reason to send a signed-in user back to login.
    if (protectedRoute && authError && (authError.name === "AuthRetryableFetchError" || (authError.status ?? 0) >= 500)) {
      throw authError;
    }

    // Protected routes
    if (protectedRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      const redirect = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      redirect.headers.set("Cache-Control", "private, no-store");
      return redirect;
    }

    // Auth routes
    if ((pathname === "/login" || pathname === "/register") && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      const redirect = NextResponse.redirect(url);
      supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
      redirect.headers.set("Cache-Control", "private, no-store");
      return redirect;
    }
  } catch {
    if (protectedRoute) {
      return new NextResponse("Não foi possível verificar a sessão. Tente novamente.", {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      });
    }
  }

  supabaseResponse.headers.set("Cache-Control", "private, no-store");
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/login",
    "/register",
  ],
};
