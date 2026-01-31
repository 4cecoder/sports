import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLeagueById, getLeagueSchedule, getLeagueStandings } from '@/lib/actions/scheduling-actions';
import { TeamListEditor } from '@/components/scheduling/team-list-editor';
import { SchedulePreview } from '@/components/scheduling/schedule-preview';
import { BracketView } from '@/components/scheduling/bracket-view';
import { StandingsTable } from '@/components/scheduling/standings-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'League Detail | Fastbreak',
};

export default async function LeagueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { id } = await params;
  const [leagueResult, scheduleResult, standingsResult] = await Promise.all([
    getLeagueById(id),
    getLeagueSchedule(id),
    getLeagueStandings(id),
  ]);

  if (!leagueResult.success) notFound();

  const league = leagueResult.data;
  const scheduleEvents = scheduleResult.success ? scheduleResult.data : [];
  const standings = standingsResult.success ? standingsResult.data : [];
  const scheduleLabel = league.scheduleType.replace(/_/g, ' ');
  const isSingleElim = league.scheduleType === 'single_elimination' || league.scheduleType === 'double_elimination';
  const isRoundRobin = league.scheduleType === 'round_robin';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
          {isSingleElim && scheduleEvents.length > 0 && (
            <Link href={`/dashboard/leagues/${id}/simulate`}>
              <Button variant="outline" size="sm">
                Simulate Bracket
              </Button>
            </Link>
          )}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{league.name}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {league.sportType}
            </Badge>
            <Badge variant="outline" className="capitalize">{scheduleLabel}</Badge>
            <span className="text-sm text-muted-foreground">
              {format(new Date(league.seasonStart), 'MMM d')} - {format(new Date(league.seasonEnd), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Teams ({league.teams.length})</h2>
            <TeamListEditor leagueId={league.id} teams={league.teams} />
          </div>
          <div className="lg:col-span-2">
            <Tabs defaultValue={isSingleElim ? 'bracket' : 'list'}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Schedule</h2>
                <TabsList>
                  {isSingleElim && <TabsTrigger value="bracket">Bracket</TabsTrigger>}
                  <TabsTrigger value="list">List</TabsTrigger>
                  {isRoundRobin && <TabsTrigger value="standings">Standings</TabsTrigger>}
                </TabsList>
              </div>

              {isSingleElim && (
                <TabsContent value="bracket">
                  <BracketView
                    events={scheduleEvents}
                    teams={league.teams}
                    mode="manage"
                  />
                </TabsContent>
              )}

              <TabsContent value="list">
                <SchedulePreview events={scheduleEvents} />
              </TabsContent>

              {isRoundRobin && (
                <TabsContent value="standings">
                  <StandingsTable standings={standings} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
