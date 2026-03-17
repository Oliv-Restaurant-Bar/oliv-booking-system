import { cookies } from "next/headers";
import { auth } from "./index";

export async function getSession() {
  try {
    const cookieStore = await cookies();

    // Get the session token directly
    const sessionToken = cookieStore.get("oliv-auth.session_token")?.value;

    if (!sessionToken) {
      return null;
    }

    // Use Better Auth's built-in method to validate session
    const session = await auth.api.getSession({
      headers: {
        cookie: `oliv-auth.session_token=${sessionToken}`,
      } as HeadersInit,
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
