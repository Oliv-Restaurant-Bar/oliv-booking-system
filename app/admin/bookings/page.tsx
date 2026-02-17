import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { BookingsPage } from "@/components/admin/BookingsPage";

export default async function AdminBookingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="px-4 md:px-8 pt-3 pb-8">
      <BookingsPage />
    </div>
  );
}
