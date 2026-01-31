import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyBookings } from '@/lib/actions/booking-actions';
import { MyBookingsClient } from './my-bookings-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Bookings | Fastbreak',
  description: 'View and manage your event bookings.',
};

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const result = await getMyBookings();

  return <MyBookingsClient bookings={result.success ? result.data : []} />;
}
