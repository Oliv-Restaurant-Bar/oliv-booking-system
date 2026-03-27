import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sendManualReminder } from '@/lib/actions/reminders';
import { headers } from 'next/headers';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const result = await sendManualReminder(id);
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in manual reminder API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
