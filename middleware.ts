import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page
  if (pathname === "/admin/login" || pathname === "/admin/sign-in") {
    return NextResponse.next();
  }

  // Protect all admin routes
  if (pathname.startsWith("/admin")) {
    // Check for session cookie
    const sessionCookie = request.cookies.get("oliv-auth.session_token")?.value;

    if (!sessionCookie) {
      // No session - redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // For additional protection, verify session is valid
    // This is a secondary check - the primary check is in the page components
    try {
      // We'll let the page components do the actual session validation
      // This middleware just ensures a session cookie exists
      return NextResponse.next();
    } catch (error) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
