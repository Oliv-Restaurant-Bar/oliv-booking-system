import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { eq, and, or, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/rbac-middleware";

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await db.query.adminUser.findFirst({
      where: eq(adminUser.id, session.user.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Split name into first and last name
    const nameParts = user.name?.split(' ') || ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return NextResponse.json({
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      role: user.role,
      avatar: user.image,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT /api/profile - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getCurrentUser();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email } = body;

    // Validate required fields
    if (!firstName?.trim() || !lastName?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Check if user exists
    const existingUser = await db.query.adminUser.findFirst({
      where: eq(adminUser.id, userId),
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is being changed and if it conflicts with another user
    if (email && email.trim() !== existingUser.email) {
      const emailConflict = await db.query.adminUser.findFirst({
        where: and(
          eq(adminUser.email, email.trim()),
          ne(adminUser.id, userId)
        ),
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: "Email already in use by another user" },
          { status: 400 }
        );
      }
    }

    // Update user profile
    const [updatedUser] = await db
      .update(adminUser)
      .set({
        name: fullName,
        email: email.trim(),
        updatedAt: new Date(),
      })
      .where(eq(adminUser.id, userId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
