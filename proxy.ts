import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error(
        "PROXY ERROR: Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return supabaseResponse;
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              supabaseResponse = NextResponse.next({
                request,
              });
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              );
            } catch (cookieErr) {
              console.error("Proxy setAll cookies error:", cookieErr);
            }
          },
        },
      }
    );

    // IMPORTANT: Avoid using supabase.auth.getSession() in proxy for protection.
    // Always use getUser() to validate session with Supabase auth server.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("Proxy getUser validation message:", authError.message);
    }

    const pathname = request.nextUrl.pathname;

    // Protect /admin and /dashboard routes
    if (!user && (pathname.startsWith("/admin") || pathname.startsWith("/dashboard"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // If user is logged in and visits /login or root /, check profile role to redirect appropriately
    if (user && (pathname === "/login" || pathname === "/")) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const url = request.nextUrl.clone();
        if (profile?.role === "admin") {
          url.pathname = "/admin";
        } else {
          url.pathname = "/dashboard";
        }
        return NextResponse.redirect(url);
      } catch (profileErr) {
        console.error("Proxy profile check error:", profileErr);
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  } catch (err) {
    console.error("Unhandled error in proxy handler:", err);
    // On any unexpected error or connection failure, return NextResponse.next() so we never crash with 500 Internal Server Error
    return supabaseResponse;
  }

  return supabaseResponse;
}

// Re-export as middleware and default so deployment runtimes (Vercel, Next.js, Edge) find the entry point correctly regardless of naming convention
export const middleware = proxy;
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files / images
     * - api routes (unless auth specific)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
