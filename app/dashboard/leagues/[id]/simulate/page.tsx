import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLeagueById, getLeagueSchedule } from '@/lib/actions/scheduling-actions';
import { SimulateBracketView } from '@/components/scheduling/simulate-bracket-view';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Simulate Bracket | Fastbreak',
};

export default async function SimulateBracketPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { id } = await params;
  const [leagueResult, scheduleResult] = await Promise.all([
    getLeagueById(id),
    getLeagueSchedule(id),
  ]);

  if (!leagueResult.success) notFound();

  const league = leagueResult.data;
  const scheduleEvents = scheduleResult.success ? scheduleResult.data : [];
  const predictions = (league as unknown as { predictions?: Record<string, string> }).predictions ?? {};

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href={`/dashboard/leagues/${id}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to League
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Simulate: {league.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {league.sportType}
            </Badge>
            <Badge variant="outline">Simulation Mode</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Click on a team name in unplayed matches to predict the winner. Completed matches are locked.
          </p>
        </div>

        <SimulateBracketView
          events={scheduleEvents}
          teams={league.teams}
          initialPredictions={predictions}
        />
      </div>
    </div>
  );
}
