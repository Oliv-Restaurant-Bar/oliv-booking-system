import { NextRequest, NextResponse } from "next/server";
import { getMenuItems, getMenuCategories, getAddons } from "@/lib/actions/menu";

/**
 * GET /api/data/menu
 * Public endpoint for fetching menu data (used by booking wizard)
 * No authentication required - this is customer-facing
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("categoryId");

    const [itemsResult, categoriesResult, addonsResult] = await Promise.all([
      getMenuItems(categoryId || undefined),
      getMenuCategories(),
      getAddons(),
    ]);

    return NextResponse.json({
      items: itemsResult.data,
      categories: categoriesResult.data,
      addons: addonsResult.data,
    });
  } catch (error) {
    console.error("Error fetching menu data:", error);
    return NextResponse.json({ error: "Failed to fetch menu data" }, { status: 500 });
  }
}
