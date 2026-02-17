import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { MenuConfigPage } from "@/components/admin/MenuConfigPageV3Complete";

export default async function AdminMenuConfigPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="px-4 md:px-8 pt-3 pb-8">
      <MenuConfigPage />
    </div>
  );
}
