import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { BookingsPage } from "@/components/admin/BookingsPage";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Permission, hasPermission } from "@/lib/auth/rbac";

export const dynamic = 'force-dynamic';

// Helper function to get all translation strings from a namespace (without evaluating)
async function getAllTranslationStrings(namespace: string) {
  // Import the messages file to get all keys and raw strings
  const messages = (await import(`@/messages/en.json`)).default as any;

  // Navigate to the correct namespace
  const keys = namespace.split('.').reduce((obj: any, key: string) => obj?.[key], messages) || {};

  const translations: Record<string, string> = {};

  const extractKeys = (obj: any, prefix = '') => {
    Object.keys(obj).forEach(key => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        extractKeys(obj[key], fullKey);
      } else {
        // Store the raw translation string, don't evaluate it
        translations[fullKey] = obj[key];
      }
    });
  };

  extractKeys(keys);
  return translations;
}

export default async function AdminBookingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const userRole = session.user.role as any;
  if (!hasPermission(userRole, Permission.VIEW_BOOKINGS)) {
    redirect("/admin");
  }

  // Get raw translation strings on server and pass to client component
  const bookingsTranslations = await getAllTranslationStrings('admin.bookings');
  const commonTranslations = await getAllTranslationStrings('common');

  const translations = {
    bookings: bookingsTranslations,
    common: commonTranslations,
  };

  return (
    <AdminPageLayout>
      <BookingsPage user={session.user} translations={translations} />
    </AdminPageLayout>
  );
}
