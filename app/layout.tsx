import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getServerLocale, getServerMessages } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: "OLIV Restaurant & Bar - Group Bookings",
  description: "Book your group event at OLIV Restaurant & Bar. Perfect for special occasions, corporate events, and celebrations.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  const messages = await getServerMessages(locale);

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
