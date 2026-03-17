import { cookies } from "next/headers";
import { auth } from "./index";

export async function getSession() {
  try {
    const cookieStore = await cookies();

    // Get the session token directly (try both regular and __Secure prefix)
    const sessionToken = cookieStore.get("oliv-auth.session_token")?.value ||
                         cookieStore.get("__Secure-oliv-auth.session_token")?.value;

    if (!sessionToken) {
      return null;
    }

    // Use Better Auth's built-in method to validate session
    const cookieName = cookieStore.get("__Secure-oliv-auth.session_token")?.value ?
                       "__Secure-oliv-auth.session_token" :
                       "oliv-auth.session_token";

    const session = await auth.api.getSession({
      headers: {
        cookie: `${cookieName}=${sessionToken}`,
      } as HeadersInit,
    });

    return session;
  } catch (error) {
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
