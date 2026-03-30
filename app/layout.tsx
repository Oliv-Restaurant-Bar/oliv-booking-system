import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getServerLocale, getServerMessages } from '@/lib/i18n/server';
import { validateEnvOrThrow } from "@/lib/config/env-validation";
import { SystemSettingsProvider } from "@/lib/contexts/SystemSettingsContext";

export const metadata: Metadata = {
  title: "OLIV Restaurant & Bar - Group Bookings",
  description: "Book your group event at OLIV Restaurant & Bar. Perfect for special occasions, corporate events, and celebrations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Validate environment variables on server startup
  // Only run once in production, run on every request in development
  if (process.env.NODE_ENV === 'production') {
    try {
      validateEnvOrThrow();
    } catch (error) {
      console.error('❌ Environment validation failed:', error);
      // In production, you might want to throw here to fail fast
      // For now, we'll just log the error
    }
  } else if (process.env.NODE_ENV === 'development') {
    // In development, validate but don't throw
    try {
      validateEnvOrThrow();
    } catch (error) {
      console.warn('⚠️  Environment validation warning:', error);
    }
  }

  const locale = await getServerLocale();
  const messages = await getServerMessages(locale);

  return (
    <html lang={locale}>
      <body className="antialiased">
        <SystemSettingsProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
          <Toaster position="top-right" richColors />
        </SystemSettingsProvider>
      </body>
    </html>
  );
}
