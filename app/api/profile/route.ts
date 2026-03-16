import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { eq, and, or, ne } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/rbac-middleware";
import { z } from 'zod';
import { auth } from "@/lib/auth";

// Validation schemas
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
});

const updateEmailSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newEmail: z.string().email('Invalid email format').max(255, 'Email too long'),
});

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

    // Check if email is being changed
    const isEmailChange = body.email && body.email !== session.user.email;

    if (isEmailChange) {
      // Email change requires password verification
      if (!body.currentPassword) {
        return NextResponse.json(
          { error: "Current password required to change email", field: "currentPassword" },
          { status: 400 }
        );
      }

      // Validate email change request
      const { currentPassword, newEmail } = updateEmailSchema.parse({
        currentPassword: body.currentPassword,
        newEmail: body.email,
      });

      // Verify current password
      try {
        const result = await auth.api.signInEmail({
          body: {
            email: session.user.email,
            password: currentPassword,
          },
        });

        if (!result || !result.user) {
          return NextResponse.json(
            { error: "Current password is incorrect", field: "currentPassword" },
            { status: 401 }
          );
        }
      } catch (error) {
        console.error("Error verifying password:", error);
        return NextResponse.json(
          { error: "Failed to verify password" },
          { status: 500 }
        );
      }

      // Check if new email already exists
      const emailConflict = await db.query.adminUser.findFirst({
        where: and(
          eq(adminUser.email, newEmail.trim()),
          ne(adminUser.id, session.user.id)
        ),
      });

      if (emailConflict) {
        return NextResponse.json(
          { error: "Email already in use by another user", field: "email" },
          { status: 409 }
        );
      }

      // TODO: Send verification email to new address
      // For now, just update the email
      const userId = session.user.id;
      const [updatedUser] = await db
        .update(adminUser)
        .set({
          email: newEmail.trim(),
          updatedAt: new Date(),
        })
        .where(eq(adminUser.id, userId))
        .returning();

      return NextResponse.json({
        success: true,
        message: "Email updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          image: updatedUser.image,
        },
      });
    } else {
      // Regular profile update (name, avatar only)
      const { firstName, lastName, email, avatar } = updateProfileSchema.parse(body);

      const userId = session.user.id;
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      // Check if email is being changed without password
      if (email && email.trim() !== session.user.email) {
        return NextResponse.json(
          { error: "Password required to change email", field: "currentPassword" },
          { status: 400 }
        );
      }

      // Check if user exists
      const existingUser = await db.query.adminUser.findFirst({
        where: eq(adminUser.id, userId),
      });

      if (!existingUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Update user profile
      const [updatedUser] = await db
        .update(adminUser)
        .set({
          name: fullName,
          image: avatar || null,
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
          image: updatedUser.image,
        },
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
