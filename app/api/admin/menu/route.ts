import { getAllMenuData } from "@/lib/actions/menu";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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
