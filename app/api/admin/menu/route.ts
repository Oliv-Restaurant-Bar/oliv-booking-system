import { getAllMenuData } from "@/lib/actions/menu";
import { NextResponse } from "next/server";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function GET() {
  try {
    // Check permission
    await requirePermissionWrapper(Permission.VIEW_MENU);

    const menuData = await getAllMenuData();
    return NextResponse.json(menuData);
  } catch (error) {
    console.error("Error in admin menu API:", error);
    return NextResponse.json(
      { categories: [], items: [], addons: [], itemsByCategory: {} },
      { status: 500 }
    );
  }
}
