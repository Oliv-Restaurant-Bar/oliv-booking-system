import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { bookings, kitchenPdfLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { sendKitchenPdfEmail } from '@/lib/actions/email';
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";
import { randomUUID } from 'crypto';

// Validation schema
const sendSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  documentName: z.string().min(1, 'Document name is required').max(255, 'Document name too long'),
  sentBy: z.string().optional(),
  pdfBase64: z.string().min(1, 'PDF data is required'),
  emails: z.array(z.string().email('Invalid email address')).min(1, 'At least one email is required').max(10, 'Too many email addresses'),
});

export async function POST(request: NextRequest) {
  try {
    // REQUIRE PERMISSION
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

    const body = await request.json();
    const { bookingId, documentName, sentBy, pdfBase64, emails } = sendSchema.parse(body);

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
          message: 'Kitchen PDF already sent',
          data: existingLog
        });
      }
    }

    // Get session info
    const session = await getSession();
    const senderName = session?.user?.name || sentBy || 'Admin';
    const senderId = session?.user?.id || 'unknown';

    // Get customer data from booking
    const customerName = booking.leadId ? 'Customer' : 'Direct Booking';
    const eventDate = booking.eventDate ? new Date(booking.eventDate).toLocaleDateString('de-CH') : 'N/A';

    // Send the email to all recipients
    let lastError: string | undefined;
    for (const email of emails) {
      const result = await sendKitchenPdfEmail({
        bookingId,
        recipientEmails: [email],
        documentName,
        pdfBase64,
        customerName,
        eventDate,
      });

      if (!result.success) {
        lastError = result.error;
        console.error(`Failed to send kitchen PDF to ${email}:`, result.error);
      }
    }

    if (lastError) {
      return NextResponse.json(
        { error: 'Failed to send one or more emails', details: lastError },
        { status: 500 }
      );
    }

    // Log the send
    const [log] = await db.insert(kitchenPdfLogs).values({
      id: randomUUID(),
      bookingId,
      documentName,
      sentAt: new Date(),
      sentBy: senderId,
      recipientEmail: emails.join(', '),
      status: 'sent',
      idempotencyKey: idempotencyKey || null,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Kitchen PDF sent successfully',
      data: log
    });
  } catch (error) {
    console.error('Error sending kitchen PDF:', error);

    // Handle authorization errors
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    // Handle validation errors
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
