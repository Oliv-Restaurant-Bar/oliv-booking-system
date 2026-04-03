import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getServerLocale, getServerMessages } from '@/lib/i18n/server';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';
import { getSession } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Get locale, messages and session on the server
  const locale = await getServerLocale();
  const messages = await getServerMessages(locale);
  const session = await getSession();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AdminLayoutClient initialSession={session}>{children}</AdminLayoutClient>
    </NextIntlClientProvider>
  );
}
