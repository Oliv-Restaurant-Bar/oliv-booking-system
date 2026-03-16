import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { venues } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { z } from 'zod';
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

// GET /api/venues - Fetch all venues
export async function GET() {
  try {
    // Require authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allVenues = await db.query.venues.findMany({
      orderBy: [asc(venues.sortOrder), asc(venues.name)],
      where: eq(venues.isActive, true),
    });

    return NextResponse.json(allVenues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}

// POST /api/venues - Create a new venue
const createVenueSchema = z.object({
  name: z.string().min(1, 'Venue name is required').max(100, 'Venue name too long'),
  description: z.string().max(500, 'Description too long').nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // REQUIRE PROPER PERMISSION
    await requirePermissionWrapper(Permission.CREATE_MENU_ITEM); // Using CREATE_MENU_ITEM as proxy for CREATE_VENUE

    const body = await request.json();
    const { name, description } = createVenueSchema.parse(body);

    // Check if venue with same name already exists
    const existing = await db.query.venues.findFirst({
      where: eq(venues.name, name),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A venue with this name already exists' },
        { status: 409 }
      );
    }

    // Get current max sort order
    const existingVenues = await db.query.venues.findMany({
      orderBy: [asc(venues.sortOrder)],
    });

    const maxSortOrder = existingVenues.length > 0
      ? Math.max(...existingVenues.map((v) => v.sortOrder || 0))
      : 0;

    // Create new venue
    const [newVenue] = await db
      .insert(venues)
      .values({
        name,
        description: description || null,
        sortOrder: maxSortOrder + 1,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newVenue, { status: 201 });
  } catch (error) {
    console.error('Error creating venue:', error);

    // Handle authorization errors
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}
