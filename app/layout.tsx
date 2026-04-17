import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getServerLocale, getServerMessages } from '@/lib/i18n/server';
import { validateEnvOrThrow } from "@/lib/config/env-validation";
import { SystemSettingsProvider } from "@/lib/contexts/SystemSettingsContext";
import { getSystemSettings } from "@/lib/actions/settings";
import { Hanken_Grotesk } from 'next/font/google';
import UserbackLoader from "@/components/common/UserbackLoader";
import NextTopLoader from 'nextjs-toploader';

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-hanken-grotesk',
});

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
  const settings = await getSystemSettings();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Preload LCP Hero Image for faster discovery */}
        <link 
          rel="preload" 
          href="https://cdn.picflow.com/assets/images/9ee40955-4bc5-4d2a-a8cc-2c3ca4bf3db5/base/9ee40955-4bc5-4d2a-a8cc-2c3ca4bf3db5.jpg" 
          as="image" 
          fetchPriority="high"
        />
      </head>
      <body className={`${hankenGrotesk.className} antialiased`}>
        <NextTopLoader
          color="var(--primary)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px var(--primary),0 0 5px var(--primary)"
        />
        <SystemSettingsProvider initialSettings={settings}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
          <Toaster position="top-right" richColors />
          <UserbackLoader />
        </SystemSettingsProvider>
      </body>
    </html>
  );
}
