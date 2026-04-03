import React from 'react';
import { AlertCircle } from 'lucide-react';
import { getBookingForCheckin } from '@/lib/actions/checkin';
import { CheckinForm } from '@/components/user/CheckinForm';

// --- COMPONENTS ---
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-[12px] shadow-sm p-6 sm:p-8 w-full max-w-md mx-auto ${className}`}>
    {children}
  </div>
);

export default async function EventCheckinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: bookingId } = await params;

  const result = await getBookingForCheckin(bookingId);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-[#f0ede6] flex items-center justify-center p-4">
        <Card>
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h1 className="text-xl font-semibold">Error</h1>
            <p className="text-gray-600">{result.error || 'Unable to load booking details. Please check the link or contact us.'}</p>
          </div>
        </Card>
      </div>
    );
  }

  const booking = result.data;

  return (
    <div className="min-h-screen bg-[#f0ede6] py-12 px-4 sm:px-6">
      <CheckinForm bookingId={bookingId} initialBooking={booking} />
    </div>
  );
}
