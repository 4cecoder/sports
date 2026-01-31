'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { BracketView } from './bracket-view';
import { type LeagueScheduleEvent } from '@/lib/actions/scheduling-actions';
import { type Team } from '@/lib/db/schema';
import { simulateBracketPick } from '@/lib/actions/espn-bracket-actions';
import { toast } from 'sonner';

interface SimulateBracketViewProps {
  events: LeagueScheduleEvent[];
  teams: Team[];
  initialPredictions: Record<string, string>;
}

export function SimulateBracketView({ events, teams, initialPredictions }: SimulateBracketViewProps) {
  const router = useRouter();
  const [predictions, setPredictions] = useState<Record<string, string>>(initialPredictions);
  const [, startTransition] = useTransition();

  const handlePickWinner = (event: LeagueScheduleEvent, teamId: string) => {
    // Optimistic update
    setPredictions((prev) => ({ ...prev, [event.id]: teamId }));

    startTransition(async () => {
      const result = await simulateBracketPick({
        eventId: event.id,
        predictedWinnerId: teamId,
      });

      if (result.success) {
        setPredictions(result.data as Record<string, string>);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to save prediction');
        // Revert optimistic update
        setPredictions((prev) => {
          const next = { ...prev };
          delete next[event.id];
          return next;
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-primary/50 border-dashed" />
          <span>Your prediction</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary/20" />
          <span>Actual result</span>
        </div>
      </div>

      <BracketView
        events={events}
        teams={teams}
        mode="simulate"
        onPickWinner={handlePickWinner}
        predictions={predictions}
      />
    </div>
  );
}
