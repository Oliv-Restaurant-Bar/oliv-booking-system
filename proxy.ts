import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page
  if (pathname === "/admin/login" || pathname === "/admin/sign-in") {
    return NextResponse.next();
  }

  // Protect all admin routes
  if (pathname.startsWith("/admin")) {
    // Check for session cookie (try both regular and __Secure prefix)
    const sessionCookie = request.cookies.get("oliv-auth.session_token")?.value ||
                          request.cookies.get("__Secure-oliv-auth.session_token")?.value;

    if (!sessionCookie) {
      // No session - redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Cookie exists, allow access
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const matcher = ["/admin/:path*"];
