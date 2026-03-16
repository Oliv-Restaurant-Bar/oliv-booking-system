import { getCompleteMenuData } from "@/lib/actions/menu";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: Request) {
  try {
    // ✅ SECURITY FIX: Rate limit to prevent scraping
    const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(',')[0].trim();
    const rateLimitResult = await checkRateLimit({
      identifier: ip,
      action: "menu_api",
      maxRequests: 60, // 60 requests per minute
      windowMinutes: 1,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const menuData = await getCompleteMenuData();
    return NextResponse.json(menuData);
  } catch (error) {
    console.error("Error in menu API:", error);
    return NextResponse.json(
      { categories: [], items: [], addons: [], itemsByCategory: {} },
      { status: 500 }
    );
  }
}
