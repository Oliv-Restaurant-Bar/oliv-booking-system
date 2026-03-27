import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookings, leads } from '@/lib/db/schema';
import { sendBookingCheckin } from '@/lib/actions/email';
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

    // Generate check-in URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oliv-restaurant.ch';
    const checkinUrl = `${baseUrl}/booking/${id}/checkin`;

    const emailResult = await sendBookingCheckin({
      bookingId: id,
      recipientEmail: lead.contactEmail,
      bookingData: { ...booking, lead },
      checkinUrl: checkinUrl,
    });

    if (emailResult.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: emailResult.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in send-checkin API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
