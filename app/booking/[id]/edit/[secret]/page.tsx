'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-foreground">Loading your booking...</p>
      </div>
    </div>
  );
}
