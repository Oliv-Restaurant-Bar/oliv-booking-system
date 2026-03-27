import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookings, leads } from '@/lib/db/schema';
import { sendBookingUpdate } from '@/lib/actions/email';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: 'Missing PDF content' }, { status: 400 });
    }

    const [result] = await db
      .select({
        booking: bookings,
        lead: leads,
      })
      .from(bookings)
      .leftJoin(leads, eq(bookings.leadId, leads.id))
      .where(eq(bookings.id, id))
      .limit(1);

    if (!result) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { booking, lead } = result;

    if (!lead?.contactEmail) {
      return NextResponse.json({ error: 'No contact email found for this booking' }, { status: 400 });
    }

    const emailResult = await sendBookingUpdate({
      bookingId: id,
      recipientEmail: lead.contactEmail,
      bookingData: { ...booking, lead },
      pdfBase64: pdfBase64,
    });

    if (emailResult.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: emailResult.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in send-update API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
