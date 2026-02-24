import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUser, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requirePermissionWrapper, getCurrentUser } from "@/lib/auth/rbac-middleware";
import { Permission, canModifyUser } from "@/lib/auth/rbac";

// PUT /api/admin/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check basic edit permission
    const session = await requirePermissionWrapper(Permission.EDIT_USER);
    const currentUserRole = session.user.role as any;
    const currentUserId = session.user.id;

    const body = await request.json();
    const { name, email, role, emailVerified } = body;

    // Check if user exists
    const existingUser = await db.query.adminUser.findFirst({
      where: eq(adminUser.id, id),
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check role hierarchy: can the current user modify the target user?
    if (!canModifyUser(currentUserRole, id, currentUserId, existingUser.role as any)) {
      return NextResponse.json(
        { error: "You don't have permission to modify this user (hierarchy restriction)" },
        { status: 403 }
      );
    }

    // If changing role, check if assigning a role equal to or higher than own
    if (role && role !== existingUser.role) {
      if (!canModifyUser(currentUserRole, id, currentUserId, role as any)) {
        return NextResponse.json(
          { error: "You cannot assign a role equal to or higher than your own" },
          { status: 403 }
        );
      }
    }

    // Check if email is being changed and if it conflicts with another user
    if (email && email !== existingUser.email) {
      const emailConflict = await db.query.adminUser.findFirst({
        where: eq(adminUser.email, email),
      });

      if (emailConflict && emailConflict.id !== id) {
        return NextResponse.json(
          { error: "Email already in use by another user" },
          { status: 400 }
        );
      }
    }

    // Update user
    const [updatedUser] = await db
      .update(adminUser)
      .set({
        name: name || existingUser.name,
        email: email || existingUser.email,
        role: role || existingUser.role,
        emailVerified: emailVerified !== undefined ? emailVerified : existingUser.emailVerified,
        updatedAt: new Date(),
      })
      .where(eq(adminUser.id, id))
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
    console.error("Error updating user:", error);

    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check basic delete permission
    const session = await requirePermissionWrapper(Permission.DELETE_USER);
    const currentUserRole = session.user.role as any;
    const currentUserId = session.user.id;

    // Check if user exists
    const existingUser = await db.query.adminUser.findFirst({
      where: eq(adminUser.id, id),
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check role hierarchy: can the current user delete the target user?
    if (!canModifyUser(currentUserRole, id, currentUserId, existingUser.role as any)) {
      return NextResponse.json(
        { error: "You don't have permission to delete this user (hierarchy restriction)" },
        { status: 403 }
      );
    }

    // Delete user (cascade will delete related records)
    await db.delete(adminUser).where(eq(adminUser.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
