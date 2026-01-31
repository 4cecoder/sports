'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { type LeagueScheduleEvent } from '@/lib/actions/scheduling-actions';
import { type Team } from '@/lib/db/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventStatusBadge } from '@/components/events/event-status-badge';
import { RecordResultDialog } from './record-result-dialog';
import { cn } from '@/lib/utils';

interface BracketViewProps {
  events: LeagueScheduleEvent[];
  teams: Team[];
  mode?: 'manage' | 'simulate' | 'view';
  onRecordResult?: (event: LeagueScheduleEvent) => void;
  onPickWinner?: (event: LeagueScheduleEvent, teamId: string) => void;
  predictions?: Record<string, string>;
}

export function BracketView({
  events,
  mode = 'view',
  onPickWinner,
  predictions,
}: BracketViewProps) {
  const [resultEvent, setResultEvent] = useState<LeagueScheduleEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (events.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No bracket data available. Generate a schedule to view the bracket.
      </p>
    );
  }

  // Group events into rounds by roundNumber if available, else by date
  const hasRoundNumbers = events.some((e) => e.roundNumber !== null);

  let rounds: { label: string; dateLabel: string; matches: LeagueScheduleEvent[] }[];

  if (hasRoundNumbers) {
    const grouped = new Map<number, LeagueScheduleEvent[]>();
    for (const event of events) {
      const rn = event.roundNumber ?? 0;
      if (!grouped.has(rn)) grouped.set(rn, []);
      grouped.get(rn)!.push(event);
    }
    // Sort within each round by matchIndex
    rounds = Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([rn, matches]) => {
        matches.sort((a, b) => (a.matchIndex ?? 0) - (b.matchIndex ?? 0));
        const isLast = rn === Math.max(...grouped.keys());
        return {
          label: isLast && matches.length === 1 ? 'Final' : `Round ${rn}`,
          dateLabel: '',
          matches,
        };
      });
  } else {
    // Fallback: group by date
    const grouped = events.reduce<Record<string, LeagueScheduleEvent[]>>(
      (acc, event) => {
        const key = format(new Date(event.date), 'yyyy-MM-dd');
        if (!acc[key]) acc[key] = [];
        acc[key].push(event);
        return acc;
      },
      {},
    );
    const sortedDates = Object.keys(grouped).sort();
    rounds = sortedDates.map((dateKey, idx) => ({
      dateLabel: format(new Date(dateKey), 'MMM d'),
      label: `Round ${idx + 1}`,
      matches: grouped[dateKey],
    }));
  }

  const totalRounds = rounds.length;

  return (
    <>
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-0 min-w-max">
          {rounds.map((round, roundIdx) => {
            const isLastRound = roundIdx === totalRounds - 1;

            return (
              <div key={round.label} className="flex items-start">
                {/* Round column */}
                <div className="flex flex-col items-center">
                  {/* Round header */}
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Badge variant="outline">{round.label}</Badge>
                    {round.dateLabel && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {round.dateLabel}
                      </span>
                    )}
                  </div>

                  {/* Matches */}
                  <div
                    className="flex flex-col justify-around flex-1"
                    style={{ gap: `${Math.pow(2, roundIdx) * 1.5}rem` }}
                  >
                    {round.matches.map((event) => (
                      <MatchCard
                        key={event.id}
                        event={event}
                        mode={mode}
                        predictions={predictions}
                        onEnterScore={() => {
                          setResultEvent(event);
                          setDialogOpen(true);
                        }}
                        onPickWinner={onPickWinner}
                      />
                    ))}
                  </div>
                </div>

                {/* Connector lines between this round and the next */}
                {!isLastRound && (
                  <ConnectorColumn
                    matchCount={round.matches.length}
                    roundIdx={roundIdx}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {mode === 'manage' && (
        <RecordResultDialog
          event={resultEvent}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
}

function MatchCard({
  event,
  mode,
  predictions,
  onEnterScore,
  onPickWinner,
}: {
  event: LeagueScheduleEvent;
  mode: 'manage' | 'simulate' | 'view';
  predictions?: Record<string, string>;
  onEnterScore: () => void;
  onPickWinner?: (event: LeagueScheduleEvent, teamId: string) => void;
}) {
  const homeName = event.homeTeam?.name ?? 'TBD';
  const awayName = event.awayTeam?.name ?? 'TBD';
  const isCompleted = event.status === 'completed';
  const isHomeWinner = event.winnerId && event.winnerId === event.homeTeamId;
  const isAwayWinner = event.winnerId && event.winnerId === event.awayTeamId;
  const canEnterScore = mode === 'manage' && event.homeTeamId && event.awayTeamId && !isCompleted;
  const isPredicted = predictions && predictions[event.id];
  const hasBothTeams = event.homeTeamId && event.awayTeamId;

  return (
    <div className={cn(
      'w-56 rounded-md border bg-card text-card-foreground shadow-sm',
      isPredicted && 'border-dashed border-primary/50',
    )}>
      {/* Home team */}
      <TeamRow
        name={homeName}
        score={event.homeScore}
        isWinner={!!isHomeWinner}
        isCompleted={isCompleted}
        hasTeam={!!event.homeTeam}
        isSimulate={mode === 'simulate'}
        isPicked={isPredicted === event.homeTeamId}
        onPick={
          mode === 'simulate' && hasBothTeams && !isCompleted && event.homeTeamId
            ? () => onPickWinner?.(event, event.homeTeamId!)
            : undefined
        }
        className="border-b"
      />
      {/* Away team */}
      <TeamRow
        name={awayName}
        score={event.awayScore}
        isWinner={!!isAwayWinner}
        isCompleted={isCompleted}
        hasTeam={!!event.awayTeam}
        isSimulate={mode === 'simulate'}
        isPicked={isPredicted === event.awayTeamId}
        onPick={
          mode === 'simulate' && hasBothTeams && !isCompleted && event.awayTeamId
            ? () => onPickWinner?.(event, event.awayTeamId!)
            : undefined
        }
      />
      {/* Footer */}
      <div className="border-t px-3 py-1.5 flex items-center justify-between">
        {canEnterScore ? (
          <Button variant="ghost" size="sm" className="text-xs h-6" onClick={onEnterScore}>
            Enter Score
          </Button>
        ) : (
          <span />
        )}
        <EventStatusBadge status={event.status} />
      </div>
    </div>
  );
}

function TeamRow({
  name,
  score,
  isWinner,
  isCompleted,
  hasTeam,
  isSimulate,
  isPicked,
  onPick,
  className,
}: {
  name: string;
  score: number | null;
  isWinner: boolean;
  isCompleted: boolean;
  hasTeam: boolean;
  isSimulate: boolean;
  isPicked: boolean;
  onPick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-3 py-2 text-sm',
        isWinner && 'bg-primary/10',
        isSimulate && onPick && 'cursor-pointer hover:bg-muted/60',
        isPicked && 'bg-primary/5',
        className,
      )}
      onClick={onPick}
    >
      <span
        className={cn(
          hasTeam ? 'font-medium' : 'text-muted-foreground italic',
          isWinner && 'font-bold text-primary',
          isPicked && !isCompleted && 'font-bold text-primary/80',
        )}
      >
        {name}
      </span>
      {(isCompleted && score !== null) && (
        <span className={cn('font-mono font-bold text-sm', isWinner && 'text-primary')}>
          {score}
        </span>
      )}
    </div>
  );
}

function ConnectorColumn({
  matchCount,
  roundIdx,
}: {
  matchCount: number;
  roundIdx: number;
}) {
  const pairs = Math.floor(matchCount / 2);
  const connectorWidth = 32;

  return (
    <div
      className="flex flex-col justify-around flex-1"
      style={{
        width: `${connectorWidth}px`,
        gap: `${Math.pow(2, roundIdx) * 1.5}rem`,
      }}
    >
      {Array.from({ length: pairs }).map((_, i) => (
        <div key={i} className="flex flex-col items-stretch relative">
          <div
            className="border-t-2 border-border"
            style={{ width: connectorWidth, height: 0 }}
          />
          <div
            className="border-r-2 border-border self-end"
            style={{
              height: `${Math.pow(2, roundIdx) * 1.5 + 5.5}rem`,
            }}
          />
          <div
            className="border-t-2 border-border"
            style={{ width: connectorWidth, height: 0 }}
          />
          <div
            className="absolute border-t-2 border-border"
            style={{
              width: connectorWidth / 2,
              right: 0,
              top: '50%',
            }}
          />
        </div>
      ))}
      {matchCount % 2 !== 0 && (
        <div
          className="border-t-2 border-border"
          style={{ width: connectorWidth }}
        />
      )}
    </div>
  );
}
