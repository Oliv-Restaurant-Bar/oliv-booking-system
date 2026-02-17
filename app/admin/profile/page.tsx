import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { ProfilePage } from "@/components/admin/ProfilePage";

export default async function AdminProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="px-4 md:px-8 pt-3 pb-8">
      <ProfilePage session={session} />
    </div>
  );
}
