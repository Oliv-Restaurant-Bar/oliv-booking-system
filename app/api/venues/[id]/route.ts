import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { venues } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// PUT /api/venues/[id] - Update a venue
const updateVenueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  description: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description } = updateVenueSchema.parse(body);

    // Check if venue exists
    const existingVenue = await db.query.venues.findFirst({
      where: eq(venues.id, id),
    });

    if (!existingVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Check if new name conflicts with another venue
    const nameConflict = await db.query.venues.findFirst({
      where: eq(venues.name, name),
    });

    if (nameConflict && nameConflict.id !== id) {
      return NextResponse.json(
        { error: 'A venue with this name already exists' },
        { status: 409 }
      );
    }

    // Update venue
    const [updatedVenue] = await db
      .update(venues)
      .set({
        name,
        description: description !== undefined ? description : existingVenue.description,
        updatedAt: new Date(),
      })
      .where(eq(venues.id, id))
      .returning();

    return NextResponse.json(updatedVenue);
  } catch (error) {
    console.error('Error updating venue:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update venue' },
      { status: 500 }
    );
  }
}

// DELETE /api/venues/[id] - Delete a venue
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if venue exists
    const existingVenue = await db.query.venues.findFirst({
      where: eq(venues.id, id),
    });

    if (!existingVenue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await db
      .update(venues)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(venues.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting venue:', error);
    return NextResponse.json(
      { error: 'Failed to delete venue' },
      { status: 500 }
    );
  }
}
