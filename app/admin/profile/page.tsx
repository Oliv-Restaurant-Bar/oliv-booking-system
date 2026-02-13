import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { DashboardSidebar } from "@/components/admin/DashboardSidebar";
import { DashboardHeader } from "@/components/admin/DashboardHeader";
import { ProfilePage } from "@/components/admin/ProfilePage";

export default async function AdminProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="sticky top-0 h-screen self-start">
        <DashboardSidebar activeItem="profile" />
      </div>

      <div className="flex-1 flex flex-col items-center overflow-x-hidden min-h-screen">
        <div className="w-full max-w-[1440px] flex flex-col flex-1">
          <div className="sticky top-0 z-10 bg-background">
            <DashboardHeader currentPage="profile" />
          </div>

          <main className="flex-1 px-4 md:px-8 pt-4 md:pt-6 pb-1">
            <ProfilePage session={session} />
          </main>
        </div>
      </div>
    </div>
  );
}
