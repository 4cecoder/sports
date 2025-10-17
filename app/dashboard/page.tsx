import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getEvents, getSportTypes } from '@/lib/actions/event-actions';
import { DashboardClient } from './dashboard-client';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View and manage all your sports events. Search, filter, and organize your event schedule.',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sportType?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const params = await searchParams;
  const eventsResult = await getEvents(params);
  const sportTypesResult = await getSportTypes();

  if (!eventsResult.success) {
    console.error('Failed to fetch events:', eventsResult.error);
  }

  if (!sportTypesResult.success) {
    console.error('Failed to fetch sport types:', sportTypesResult.error);
  }

  const events = eventsResult.success ? eventsResult.data : [];
  const sportTypes = sportTypesResult.success ? sportTypesResult.data : [];

  return (
    <DashboardClient
      initialEvents={events}
      user={user}
      initialSearch={params.search}
      initialSportType={params.sportType}
      availableSportTypes={sportTypes}
    />
  );
}
