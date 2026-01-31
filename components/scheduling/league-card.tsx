'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type LeagueWithTeams } from '@/lib/actions/scheduling-actions';
import { deleteLeague, generateSchedule } from '@/lib/actions/scheduling-actions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Users, Trash2, Play } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

interface LeagueCardProps {
  league: LeagueWithTeams;
}

export function LeagueCard({ league }: LeagueCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const scheduleLabel = league.scheduleType.replace(/_/g, ' ');

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteLeague({ id: league.id });
    if (result.success) {
      toast.success('League deleted');
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsDeleting(false);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generateSchedule({ leagueId: league.id });
    if (result.success) {
      toast.success(`Generated ${result.data.length} matches`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsGenerating(false);
  };

  return (
    <Card className="glow-hover group overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/50">
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-lg group-hover:text-primary transition-colors">
          <Link href={`/dashboard/leagues/${league.id}`} className="hover:underline">
            {league.name}
          </Link>
        </CardTitle>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {league.sportType}
          </Badge>
          <Badge variant="outline" className="capitalize">{scheduleLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {league.teams.length} teams
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarIcon className="h-3.5 w-3.5" />
          {format(new Date(league.seasonStart), 'MMM d')} - {format(new Date(league.seasonEnd), 'MMM d, yyyy')}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 border-t border-border/50 bg-muted/20 pt-4">
        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
          <Play className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Schedule'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}
          className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
