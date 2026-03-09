'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SkeletonForm } from '@/components/ui/skeleton-loaders';

interface EditBookingPageProps {
  params: Promise<{
    id: string;
    secret: string;
  }>;
}

export default function EditBookingPage({ params }: EditBookingPageProps) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id: bookingId, secret: editSecret }) => {
      setId(bookingId);
      setSecret(editSecret);

      // Redirect to wizard with booking info in sessionStorage
      sessionStorage.setItem('edit_booking_id', bookingId);
      sessionStorage.setItem('edit_secret', editSecret);
      sessionStorage.setItem('edit_mode', 'true');

      // Redirect to wizard
      router.push('/wizard?edit=true');
    });
  }, [params, router]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2">Loading Your Booking</h1>
          <p className="text-muted-foreground">Please wait while we fetch your booking details...</p>
        </div>
        <SkeletonForm fields={5} />
      </div>
    </div>
  );
}
