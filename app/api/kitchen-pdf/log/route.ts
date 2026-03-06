import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { bookings, kitchenPdfLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema
const logSchema = z.object({
    bookingId: z.string().uuid(),
    documentName: z.string(),
    sentBy: z.string(),
    status: z.enum(['sent', 'failed']).default('sent'),
    recipientEmail: z.string().default('Internal Download'),
});

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { bookingId, documentName, sentBy, status, recipientEmail } = logSchema.parse(body);

        // Check if booking exists
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        const sentAt = new Date();
        const messageId = `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        // Log the action to the database
        await db.insert(kitchenPdfLogs).values({
            id: messageId,
            bookingId,
            documentName,
            sentAt,
            sentBy,
            recipientEmail,
            status,
        });

        return NextResponse.json({
            success: true,
            documentName,
            sentAt,
            messageId,
        });

    } catch (error) {
        console.error('Error logging kitchen PDF action:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to log kitchen PDF action' },
            { status: 500 }
        );
    }
}
