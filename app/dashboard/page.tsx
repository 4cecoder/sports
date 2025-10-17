import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getEvents } from '@/lib/actions/event-actions';
import { DashboardClient } from './dashboard-client';

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

  if (!eventsResult.success) {
    console.error('Failed to fetch events:', eventsResult.error);
  }

  const events = eventsResult.success ? eventsResult.data : [];

  return (
    <DashboardClient
      initialEvents={events}
      user={user}
      initialSearch={params.search}
      initialSportType={params.sportType}
    />
  );
}
