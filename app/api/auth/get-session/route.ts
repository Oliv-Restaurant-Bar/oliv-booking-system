import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/server";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(null);
        }
        return NextResponse.json(session);
    } catch (error) {
        console.error("Error in get-session API:", error);
        return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
    }
}
