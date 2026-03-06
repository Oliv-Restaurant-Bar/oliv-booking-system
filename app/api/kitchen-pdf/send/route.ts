import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { bookings, kitchenPdfLogs, leads } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { sendKitchenPdfEmail } from '@/lib/actions/email';

// Validation schema
const sendSchema = z.object({
  bookingId: z.string().uuid(),
  documentName: z.string(),
  sentBy: z.string(),
  pdfBase64: z.string(),
  emails: z.array(z.string().email()),
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

    // Get recipient emails from request body
    const recipientEmails = body.emails;

    // Send the email with the PDF attachment
    const emailResult = await sendKitchenPdfEmail({
      bookingId,
      recipientEmails,
      documentName,
      pdfBase64: body.pdfBase64,
      customerName: booking.leadId ? (await db.query.leads.findFirst({ where: eq(leads.id, booking.leadId) }))?.contactName || "Customer" : "Customer",
      eventDate: (booking.eventDate as any) instanceof Date
        ? (booking.eventDate as unknown as Date).toLocaleDateString('de-CH')
        : String(booking.eventDate),
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Failed to send kitchen PDF email');
    }

    const sentAt = new Date();

    // Log the send action to the database
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await db.insert(kitchenPdfLogs).values({
      id: messageId,
      bookingId,
      documentName,
      sentAt,
      sentBy: body.sentBy || 'Admin',
      recipientEmail: recipientEmails.join(', '),
      status: 'sent',
      idempotencyKey: idempotencyKey,
    });

    return NextResponse.json({
      success: true,
      documentName,
      sentAt,
      messageId,
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
