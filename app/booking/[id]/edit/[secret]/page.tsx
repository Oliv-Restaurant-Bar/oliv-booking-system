'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WizardLoading } from '@/components/user/WizardLoading';

interface EditBookingPageProps {
  params: Promise<{
    id: string;
    secret: string;
  }>;
}

export default function EditBookingPage({ params }: EditBookingPageProps) {
  const router = useRouter();

  useEffect(() => {
    params.then(({ id: bookingId, secret: editSecret }) => {
      // Redirect to wizard with booking info in sessionStorage
      sessionStorage.setItem('edit_booking_id', bookingId);
      sessionStorage.setItem('edit_secret', editSecret);
      sessionStorage.setItem('edit_mode', 'true');

      // Redirect to wizard
      router.push('/wizard?edit=true');
    });
  }, [params, router]);

  return <WizardLoading />;
}
