import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("🔍 Proxy:", {
    pathname,
    method: request.method,
    hasCookie: !!request.cookies.get("oliv-auth.session_token")?.value,
  });

  // Allow access to login page
  if (pathname === "/admin/login" || pathname === "/admin/sign-in") {
    console.log("✅ Proxy: Allowing login page access");
    return NextResponse.next();
  }

  // Protect all admin routes
  if (pathname.startsWith("/admin")) {
    // Check for session cookie (try both regular and __Secure prefix)
    const sessionCookie = request.cookies.get("oliv-auth.session_token")?.value ||
                          request.cookies.get("__Secure-oliv-auth.session_token")?.value;

    console.log("🔍 Proxy: Admin route check:", {
      hasCookie: !!sessionCookie,
      cookiePreview: sessionCookie ? `${sessionCookie.substring(0, 10)}...` : 'none',
      hasRegularCookie: !!request.cookies.get("oliv-auth.session_token")?.value,
      hasSecureCookie: !!request.cookies.get("__Secure-oliv-auth.session_token")?.value,
    });

    if (!sessionCookie) {
      console.log("❌ Proxy: No cookie, redirecting to login");
      // No session - redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For additional protection, verify session is valid
    // This is a secondary check - the primary check is in the page components
    try {
      console.log("✅ Proxy: Cookie exists, allowing access");
      // We'll let the page components do the actual session validation
      // This middleware just ensures a session cookie exists
      return NextResponse.next();
    } catch (error) {
      console.log("❌ Proxy: Error, redirecting to login");
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const matcher = ["/admin/:path*"];
