import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { venues } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { z } from 'zod';

// GET /api/venues - Fetch all venues
export async function GET() {
  try {
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
  name: z.string().min(1, 'Venue name is required'),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = createVenueSchema.parse(body);

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

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'A venue with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create venue' },
      { status: 500 }
    );
  }
}
