import { cookies } from "next/headers";
import { auth } from "./index";

export async function getSession() {
  try {
    const cookieStore = await cookies();

    // Get the session token directly
    const sessionToken = cookieStore.get("oliv-auth.session_token")?.value;

    console.log("🔍 getSession Debug:", {
      hasCookie: !!sessionToken,
      cookiePreview: sessionToken ? `${sessionToken.substring(0, 10)}...` : 'none',
      env: process.env.NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
    });

    if (!sessionToken) {
      console.log("❌ No session token found");
      return null;
    }

    // Use Better Auth's built-in method to validate session
    const session = await auth.api.getSession({
      headers: {
        cookie: `oliv-auth.session_token=${sessionToken}`,
      } as HeadersInit,
    });

    console.log("✅ Session result:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
    });

    return session;
  } catch (error) {
    console.error("❌ Error getting session:", error);
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
