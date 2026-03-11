'use server';

import { db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth/rbac-middleware";
import { Permission, canModifyUser, hasPermission } from "@/lib/auth/rbac";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";

export interface CreateAdminUserInput {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "moderator" | "read_only";
  password: string;
}

export async function createAdminUser(input: CreateAdminUserInput) {
  try {
    // Check authentication and permission
    await requirePermissionWrapper(Permission.MANAGE_USERS);
    const session = await requireAuth();
    const currentUserId = session.user.id;
    const currentUserRole = session.user.role as any;

    // Only super_admin can create users
    if (currentUserRole !== 'super_admin') {
      return { success: false, error: "Only super admins can create users" };
    }

    // Super admins can create any role including other super admins
    // No additional role hierarchy check needed for super admins

    // Create user using Better Auth
    await auth.api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
        role: input.role,
      },
    });

    // Update role
    await db
      .update(adminUser)
      .set({ role: input.role })
      .where(eq(adminUser.email, input.email));

    revalidatePath("/admin/user-management");

    return { success: true };
  } catch (error) {
    console.error("Error creating admin user:", error);
    return { success: false, error: "Failed to create admin user" };
  }
}

export async function updateAdminUser(id: string, updates: Partial<typeof adminUser.$inferInsert>) {
  try {
    // Check authentication and permission
    await requirePermissionWrapper(Permission.MANAGE_USERS);
    const session = await requireAuth();
    const currentUserId = session.user.id;
    const currentUserRole = session.user.role as any;

    // Get the target user to check their role
    const [targetUser] = await db.select().from(adminUser).where(eq(adminUser.id, id)).limit(1);

    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    // Super admins can modify any user including other super admins
    if (currentUserRole === 'super_admin') {
      // Allow all modifications for super admins
      const [user] = await db
        .update(adminUser)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(adminUser.id, id))
        .returning();

      revalidatePath("/admin/user-management");

      return { success: true, data: user };
    }

    // For non-super admins, check if they can modify this user
    if (!canModifyUser(currentUserRole, id, currentUserId, targetUser.role as any)) {
      return { success: false, error: "You don't have permission to modify this user" };
    }

    // If changing role, check if the new role is allowed
    if (updates.role && updates.role !== targetUser.role) {
      if (!canModifyUser(currentUserRole, id, currentUserId, updates.role as any)) {
        return { success: false, error: "You cannot assign a role equal to or higher than your own" };
      }
    }

    const [user] = await db
      .update(adminUser)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(adminUser.id, id))
      .returning();

    revalidatePath("/admin/user-management");

    return { success: true, data: user };
  } catch (error) {
    console.error("Error updating admin user:", error);
    return { success: false, error: "Failed to update admin user" };
  }
}

export async function deleteAdminUser(id: string) {
  try {
    // Check authentication and permission
    await requirePermissionWrapper(Permission.DELETE_USER);
    const session = await requireAuth();
    const currentUserId = session.user.id;
    const currentUserRole = session.user.role as any;

    // Prevent self-deletion
    if (id === currentUserId) {
      return { success: false, error: "You cannot delete your own account" };
    }

    // Get the target user to check their role
    const [targetUser] = await db.select().from(adminUser).where(eq(adminUser.id, id)).limit(1);

    if (!targetUser) {
      return { success: false, error: "User not found" };
    }

    // Check if current user can delete this user (only higher roles can delete)
    if (!canModifyUser(currentUserRole, id, currentUserId, targetUser.role as any)) {
      return { success: false, error: "You don't have permission to delete this user" };
    }

    await db.delete(adminUser).where(eq(adminUser.id, id));

    revalidatePath("/admin/user-management");

    return { success: true };
  } catch (error) {
    console.error("Error deleting admin user:", error);
    return { success: false, error: "Failed to delete admin user" };
  }
}

export async function getAdminUsers() {
  try {
    // Require VIEW_USERS permission
    await requirePermissionWrapper(Permission.VIEW_USERS);

    const users = await db.select().from(adminUser);

    // Remove passwords from response
    const sanitizedUsers = users.map(({ password: _, ...user }) => user);

    return { success: true, data: sanitizedUsers };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return { success: false, error: "Failed to fetch admin users", data: [] };
  }
}

export async function getAdminUserById(id: string) {
  try {
    // Require VIEW_USERS permission
    await requirePermissionWrapper(Permission.VIEW_USERS);

    const [user] = await db.select().from(adminUser).where(eq(adminUser.id, id)).limit(1);

    if (!user) {
      return { success: false, error: "Admin user not found", data: null };
    }

    // Remove password from response
    const { password: _, ...sanitizedUser } = user;

    return { success: true, data: sanitizedUser };
  } catch (error) {
    console.error("Error fetching admin user:", error);
    return { success: false, error: "Failed to fetch admin user", data: null };
  }
}
