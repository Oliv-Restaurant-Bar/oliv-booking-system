import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUser, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";

// GET /api/admin/users - Fetch all users
export async function GET() {
  try {
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
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
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

    // Hash the password
    const hashedPassword = await argon2.hash(password || "defaultPassword123", {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Create user
    const [newUser] = await db
      .insert(adminUser)
      .values({
        id: crypto.randomUUID(),
        name,
        email,
        emailVerified: true,
        role: role || "read_only",
      })
      .returning();

    // Create credential account with password
    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId: newUser.id,
      accountId: email,
      providerId: "credential",
      password: hashedPassword,
    });

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.emailVerified ? "Active" : "Inactive",
      createdAt: newUser.createdAt?.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
