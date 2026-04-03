import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { BookingsPage } from "@/components/admin/BookingsPage";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Permission, hasPermission } from "@/lib/auth/rbac";
import { fetchBookings } from "@/lib/actions/fetch-bookings";
import { getBookingDetailAction, getVenuesAction, getKitchenPdfHistoryAction } from "@/lib/actions/admin-bookings";
import { getUsersForAdmin } from "@/lib/actions/admin-users";

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

export default async function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
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

  // Fetch initial bookings for SSR
  const [initialBookingsData, venues, adminUsers] = await Promise.all([
    fetchBookings({ page: 1, limit: 1000, sort: 'created_at' }),
    id ? getVenuesAction() : Promise.resolve([]),
    id ? getUsersForAdmin() : Promise.resolve([]),
  ]);

  let initialDeepLinkData = null;
  if (id) {
    const [bookingDetail, pdfHistory] = await Promise.all([
      getBookingDetailAction(id),
      getKitchenPdfHistoryAction(id)
    ]);

    if (bookingDetail) {
      initialDeepLinkData = {
        booking: bookingDetail,
        venues: venues,
        adminUsers: adminUsers,
        pdfHistory: pdfHistory,
      };
    }
  }

  console.log(`[SSR] AdminBookingsPage: Fetched ${initialBookingsData?.bookings?.length || 0} bookings list.`);
  if (id) console.log(`[SSR] AdminBookingsPage: Prefetched detail data for ID ${id}`);

  return (
    <AdminPageLayout>
      <BookingsPage 
        user={session.user} 
        translations={translations} 
        initialBookings={initialBookingsData.bookings} 
        initialDeepLinkData={initialDeepLinkData}
      />
    </AdminPageLayout>
  );
}
