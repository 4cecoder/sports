import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getEventById } from '@/lib/actions/event-actions';
import { getEventBookings } from '@/lib/actions/booking-actions';
import { AttendeeList } from '@/components/booking/attendee-list';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Event Bookings | Fastbreak',
};

export default async function EventBookingsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { id } = await params;
  const [eventResult, bookingsResult] = await Promise.all([
    getEventById(id),
    getEventBookings(id),
  ]);

  if (!eventResult.success) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{eventResult.data.name} - Bookings</h1>
          <p className="text-muted-foreground">{eventResult.data.sportType}</p>
        </div>

        <AttendeeList bookings={bookingsResult.success ? bookingsResult.data : []} />
      </div>
    </div>
  );
}
