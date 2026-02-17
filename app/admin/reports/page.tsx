import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { ReportsPage } from "@/components/admin/ReportsPage";

export default async function AdminReportsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="px-4 md:px-8 pt-3 pb-8">
      <ReportsPage />
    </div>
  );
}
