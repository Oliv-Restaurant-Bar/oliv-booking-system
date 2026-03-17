import { headers } from "next/headers";
import { auth } from "./index";

export async function getSession() {
  try {
    // Call Better Auth's getSession with all request headers
    const session = await auth.api.getSession({
      headers: await headers(),
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
