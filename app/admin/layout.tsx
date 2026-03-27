import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getServerLocale, getServerMessages } from '@/lib/i18n/server';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Get locale and messages on the server
  const locale = await getServerLocale();
  const messages = await getServerMessages(locale);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </NextIntlClientProvider>
  );
}
