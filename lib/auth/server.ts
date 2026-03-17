import { cookies } from "next/headers";
import { auth } from "./index";

export async function getSession() {
  try {
    const cookieStore = await cookies();

    // Build a proper headers object from cookies
    const headers: Record<string, string> = {};

    // Add cookies as a header
    const allCookies = cookieStore.getAll();
    if (allCookies.length > 0) {
      headers.cookie = allCookies
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");
    }

    // Call Better Auth's getSession with proper headers
    const session = await auth.api.getSession({
      headers: headers as HeadersInit,
    });

    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session;
}
