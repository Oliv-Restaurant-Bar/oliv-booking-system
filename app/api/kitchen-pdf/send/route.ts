import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { bookings, kitchenPdfLogs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

// Validation schema
const sendSchema = z.object({
  bookingId: z.string().uuid(),
  documentName: z.string(),
  sentBy: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, documentName, sentBy } = sendSchema.parse(body);

    // Check if booking exists
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check idempotency key to prevent duplicate sends
    const idempotencyKey = request.headers.get('Idempotency-Key');

    if (idempotencyKey) {
      // Check if this key was already used
      const existingLog = await db.query.kitchenPdfLogs.findFirst({
        where: eq(kitchenPdfLogs.idempotencyKey, idempotencyKey),
      });

      if (existingLog) {
        // Return the existing response (idempotent)
        return NextResponse.json({
          success: true,
          documentName: existingLog.documentName,
          sentAt: existingLog.sentAt,
          messageId: existingLog.id,
          kitchenEmail: existingLog.recipientEmail,
          alreadySent: true,
        });
      }
    }

    // Get recipient emails from request body or use default kitchen email
    const recipientEmails = body.emails || ['kitchen@oliv.com'];

    // Here you would actually send the email
    // For now, we'll just log it
    // TODO: Integrate with your email service (e.g., ZeptoMail, Resend, etc.)

    const sentAt = new Date();

    // Log the send
    const logId = `kpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(kitchenPdfLogs).values({
      id: logId,
      bookingId,
      documentName,
      sentAt,
      sentBy: sentBy || session.user.name || 'Admin',
      recipientEmail: recipientEmails.join(', '),
      status: 'sent',
      idempotencyKey: idempotencyKey || null,
    });

    // Update booking with kitchen PDF status
    // Note: You might need to add kitchenPdfStatus field to your bookings table
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      documentName,
      sentAt,
      messageId: logId,
      kitchenEmail: recipientEmails.join(', '),
    });

  } catch (error) {
    console.error('Error sending kitchen PDF:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send kitchen PDF' },
      { status: 500 }
    );
  }
}
