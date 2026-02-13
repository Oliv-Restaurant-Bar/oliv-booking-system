import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUser, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// PUT /api/admin/users/[id] - Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Delete user (cascade will delete related records)
    await db.delete(adminUser).where(eq(adminUser.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
