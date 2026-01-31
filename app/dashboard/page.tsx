import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getEvents, getSportTypes } from '@/lib/actions/event-actions';
import { getTemplates } from '@/lib/actions/template-actions';
import { getRecurrenceRules } from '@/lib/actions/recurrence-actions';
import { getLeagues } from '@/lib/actions/scheduling-actions';
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
  searchParams: Promise<{ search?: string; sportType?: string; status?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const params = await searchParams;

  const [eventsResult, sportTypesResult, templatesResult, recurrenceResult, leaguesResult] = await Promise.all([
    getEvents(params),
    getSportTypes(),
    getTemplates(),
    getRecurrenceRules(),
    getLeagues(),
  ]);

  return (
    <DashboardClient
      initialEvents={eventsResult.success ? eventsResult.data : []}
      user={user}
      initialSearch={params.search}
      initialSportType={params.sportType}
      initialStatus={params.status}
      availableSportTypes={sportTypesResult.success ? sportTypesResult.data : []}
      templates={templatesResult.success ? templatesResult.data : []}
      recurrenceRules={recurrenceResult.success ? recurrenceResult.data : []}
      leagues={leaguesResult.success ? leaguesResult.data : []}
    />
  );
}
