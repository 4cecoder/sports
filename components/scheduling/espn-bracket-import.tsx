'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, ArrowLeft, Trophy } from 'lucide-react';
import { fetchESPNPlayoffs, importESPNBracket, type ParsedBracketGame } from '@/lib/actions/espn-bracket-actions';
import { sports, type SportType } from '@/lib/constants/sports';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function ESPNBracketImport() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const [games, setGames] = useState<ParsedBracketGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSportSelect = async (sport: SportType) => {
    setSelectedSport(sport);
    setLoading(true);
    setGames([]);

    const result = await fetchESPNPlayoffs(sport);

    if (result.success) {
      setGames(result.data);
      toast.success(`Found ${result.data.length} playoff games`);
    } else {
      toast.error(result.error || 'Failed to fetch playoff data');
    }

    setLoading(false);
  };

  const handleImport = () => {
    if (!selectedSport || games.length === 0) return;

    const sportData = sports.find((s) => s.id === selectedSport);

    startTransition(async () => {
      const result = await importESPNBracket({
        sport: selectedSport,
        leagueName: `${sportData?.name ?? selectedSport.toUpperCase()} Playoffs`,
        games: games.map((g) => ({
          externalId: g.externalId,
          name: g.name,
          date: g.date,
          homeTeam: g.homeTeam,
          awayTeam: g.awayTeam,
          round: g.round,
          matchIndex: g.matchIndex,
          status: g.status,
        })),
      });

      if (result.success) {
        toast.success(`Imported ${result.data.gamesCreated} games with ${result.data.teamsCreated} teams`);
        router.push(`/dashboard/leagues/${result.data.leagueId}`);
      } else {
        toast.error(result.error || 'Failed to import bracket');
      }
    });
  };

  const selectedSportData = sports.find((s) => s.id === selectedSport);

  // Group games by round for preview
  const roundGroups = games.reduce<Record<number, ParsedBracketGame[]>>((acc, game) => {
    if (!acc[game.round]) acc[game.round] = [];
    acc[game.round].push(game);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Sport Selection */}
      {!selectedSport && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Trophy className="mx-auto h-10 w-10 text-primary" />
            <h2 className="text-2xl font-bold">Import ESPN Playoff Bracket</h2>
            <p className="text-muted-foreground">Select a sport to fetch current playoff data</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sports.map((sport) => (
              <Card
                key={sport.id}
                className={cn(
                  'cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2',
                  sport.bgGradient,
                )}
                onClick={() => handleSportSelect(sport.id)}
              >
                <CardHeader className="text-center pb-2">
                  <div className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br shadow-md mx-auto',
                    sport.gradient,
                  )}>
                    {sport.emoji}
                  </div>
                  <CardTitle className="text-lg">{sport.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground pb-4">
                  {sport.fullName}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {selectedSport && loading && (
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Fetching {selectedSportData?.name} playoff data from ESPN...</p>
        </div>
      )}

      {/* Preview + Import */}
      {selectedSport && !loading && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => { setSelectedSport(null); setGames([]); }}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br shadow-md',
                selectedSportData?.gradient,
              )}>
                {selectedSportData?.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedSportData?.name} Playoffs</h2>
                <p className="text-sm text-muted-foreground">{games.length} games found</p>
              </div>
            </div>
            {games.length > 0 && (
              <Button onClick={handleImport} disabled={isPending} className="gap-2">
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Import Bracket
              </Button>
            )}
          </div>

          {games.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No playoff data available for {selectedSportData?.name} at this time.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(roundGroups)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([round, roundGames]) => (
                  <div key={round}>
                    <h3 className="font-semibold mb-2">Round {round}</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {roundGames.map((game) => (
                        <Card key={game.externalId} className="p-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex-1">
                              <div className={cn('font-medium', game.homeTeam.winner && 'text-primary font-bold')}>
                                {game.homeTeam.name} {game.homeTeam.score !== undefined ? `(${game.homeTeam.score})` : ''}
                              </div>
                              <div className={cn('font-medium', game.awayTeam.winner && 'text-primary font-bold')}>
                                {game.awayTeam.name} {game.awayTeam.score !== undefined ? `(${game.awayTeam.score})` : ''}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge variant={game.status === 'completed' ? 'default' : 'outline'} className="text-xs">
                                {game.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(game.date), 'MMM d')}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
