'use server';

import { db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function getUsersForAdmin() {
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
      role: user.role as 'super_admin' | 'admin' | 'moderator' | 'read_only',
      status: (user.emailVerified ? "Active" : "Inactive") as 'Active' | 'Inactive',
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return formattedUsers;
  } catch (error) {
    console.error("Error fetching users for admin:", error);
    return [];
  }
}
