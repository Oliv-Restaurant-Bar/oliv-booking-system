import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.adminUser,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    // Disable public sign-up - users can only be created by admin
    sendPasswordResetEmail: async () => {
      // TODO: Implement email sending
    },
    sendVerificationEmail: async () => {
      // TODO: Implement email sending
    },
  },
  // Disable sign-up endpoint
  advanced: {
    cookiePrefix: "oliv-auth",
    crossSubDomainCookies: {
      enabled: false,
    },
    // Disable sign-up
    disableSignUp: true,
    // Explicit cookie configuration for production
    cookies: {
      sessionToken: {
        attributes: {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        },
      },
    },
    // Add trusted origins for production
    trustedOrigins: process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : ['http://localhost:3000'],
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
});

export type Session = typeof auth.$Infer.Session;
