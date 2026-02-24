import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

// GET /api/admin/users - Fetch all users
export async function GET() {
  try {
    // Check permission
    await requirePermissionWrapper(Permission.VIEW_USERS);

    const users = await db.query.adminUser.findMany({
      orderBy: (adminUser, { desc }) => [desc(adminUser.createdAt)],
    });

    // Format users for the frontend
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.emailVerified ? "Active" : "Inactive",
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);

    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    // Check permission
    await requirePermissionWrapper(Permission.CREATE_USER);

    const body = await request.json();
    const { name, email, role, password } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.adminUser.findFirst({
      where: eq(adminUser.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user using Better Auth programmatic API
    // This will hash the password correctly and create the account record
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password: password || "defaultPassword123",
        name,
        role: role || "read_only",
      },
    });

    if (!result || !result.user) {
      throw new Error("Failed to create user via Better Auth");
    }

    // Update the role and ensure email is marked as verified
    const [updatedUser] = await db
      .update(adminUser)
      .set({
        role: role || "read_only",
        emailVerified: true
      })
      .where(eq(adminUser.id, result.user.id))
      .returning();

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.emailVerified ? "Active" : "Inactive",
      createdAt: updatedUser.createdAt?.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    // Check if error is from Better Auth
    const errorMessage = error instanceof Error ? error.message : "Failed to create user";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
