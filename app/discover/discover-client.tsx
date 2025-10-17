'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Calendar,
  MapPin,
  Download,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { fetchESPNEvents, importESPNEvent, type SportType } from '@/lib/actions/external-events';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const sports = [
  {
    id: 'nba' as SportType,
    name: 'NBA',
    fullName: 'National Basketball Association',
    emoji: '🏀',
    gradient: 'from-orange-500 to-red-500',
    hoverGradient: 'hover:from-orange-600 hover:to-red-600',
    bgGradient: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
  },
  {
    id: 'nfl' as SportType,
    name: 'NFL',
    fullName: 'National Football League',
    emoji: '🏈',
    gradient: 'from-green-500 to-emerald-600',
    hoverGradient: 'hover:from-green-600 hover:to-emerald-700',
    bgGradient: 'bg-gradient-to-br from-green-500/10 to-emerald-600/10',
  },
  {
    id: 'mlb' as SportType,
    name: 'MLB',
    fullName: 'Major League Baseball',
    emoji: '⚾',
    gradient: 'from-blue-500 to-indigo-600',
    hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
    bgGradient: 'bg-gradient-to-br from-blue-500/10 to-indigo-600/10',
  },
  {
    id: 'nhl' as SportType,
    name: 'NHL',
    fullName: 'National Hockey League',
    emoji: '🏒',
    gradient: 'from-cyan-500 to-blue-600',
    hoverGradient: 'hover:from-cyan-600 hover:to-blue-700',
    bgGradient: 'bg-gradient-to-br from-cyan-500/10 to-blue-600/10',
  },
];

interface ESPNEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  competitions: Array<{
    venue?: {
      fullName: string;
      address?: {
        city?: string;
        state?: string;
      };
    };
  }>;
}

export default function DiscoverClient() {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const [events, setEvents] = useState<ESPNEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingEventIds, setImportingEventIds] = useState<Set<string>>(new Set());
  const [importedEventIds, setImportedEventIds] = useState<Set<string>>(new Set());

  const handleSportSelect = async (sport: SportType) => {
    setSelectedSport(sport);
    setLoading(true);
    setEvents([]);

    const result = await fetchESPNEvents(sport);

    if (result.success && result.data) {
      setEvents(result.data);
      toast.success(`Found ${result.data.length} ${sport.toUpperCase()} events`);
    } else {
      toast.error(result.error || 'Failed to fetch events');
    }

    setLoading(false);
  };

  const handleImportEvent = async (event: ESPNEvent, sport: SportType) => {
    setImportingEventIds((prev) => new Set(prev).add(event.id));

    const result = await importESPNEvent(event, sport);

    setImportingEventIds((prev) => {
      const next = new Set(prev);
      next.delete(event.id);
      return next;
    });

    if (result.success) {
      setImportedEventIds((prev) => new Set(prev).add(event.id));
      toast.success('Event imported successfully');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to import event');
    }
  };

  const selectedSportData = sports.find((s) => s.id === selectedSport);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-primary to-accent p-2">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold md:text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Discover Events
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Import official sports events from ESPN
              </p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Sport Selection */}
        {!selectedSport && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold md:text-4xl">Choose Your Sport</h2>
              <p className="text-muted-foreground text-lg">
                Select a league to discover and import official events
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto pt-8">
              {sports.map((sport) => (
                <Card
                  key={sport.id}
                  className={cn(
                    'cursor-pointer group overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-transparent',
                    sport.bgGradient
                  )}
                  onClick={() => handleSportSelect(sport.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-center mb-4">
                      <div
                        className={cn(
                          'w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110',
                          sport.gradient
                        )}
                      >
                        {sport.emoji}
                      </div>
                    </div>
                    <CardTitle className="text-2xl text-center font-bold">
                      {sport.name}
                    </CardTitle>
                    <CardDescription className="text-center text-sm">
                      {sport.fullName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      className={cn(
                        'w-full bg-gradient-to-r text-white border-0 transition-all',
                        sport.gradient,
                        sport.hoverGradient
                      )}
                      size="sm"
                    >
                      Browse Events
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Event List */}
        {selectedSport && selectedSportData && (
          <div className="space-y-6 animate-fade-in">
            {/* Back Button and Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedSport(null);
                  setEvents([]);
                }}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br shadow-md',
                    selectedSportData.gradient
                  )}
                >
                  {selectedSportData.emoji}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedSportData.name} Events</h2>
                  <p className="text-sm text-muted-foreground">
                    {events.length} events available
                  </p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center space-y-4">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br shadow-lg animate-bounce mx-auto',
                      selectedSportData.gradient
                    )}
                  >
                    {selectedSportData.emoji}
                  </div>
                  <div>
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-lg font-medium">Loading {selectedSportData.name} events...</p>
                    <p className="text-sm text-muted-foreground">Fetching from ESPN</p>
                  </div>
                </div>
              </div>
            ) : events.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="flex min-h-[500px] items-center justify-center">
                  <div className="text-center space-y-4">
                    <div
                      className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br shadow-lg mx-auto opacity-50',
                        selectedSportData.gradient
                      )}
                    >
                      {selectedSportData.emoji}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                      <p className="text-muted-foreground">
                        There are no {selectedSportData.name} events available at this time
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const venue = event.competitions[0]?.venue;
                  const isImporting = importingEventIds.has(event.id);
                  const isImported = importedEventIds.has(event.id);

                  return (
                    <Card
                      key={event.id}
                      className={cn(
                        'group overflow-hidden border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
                        isImported
                          ? 'border-accent/50 bg-accent/5'
                          : 'border-border/50 hover:border-primary/50'
                      )}
                    >
                      <CardHeader className="pb-3 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center text-xl bg-gradient-to-br shadow-md shrink-0',
                              selectedSportData.gradient
                            )}
                          >
                            {selectedSportData.emoji}
                          </div>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'bg-gradient-to-r text-white border-0',
                              selectedSportData.gradient
                            )}
                          >
                            ESPN
                          </Badge>
                        </div>
                        <CardTitle className="line-clamp-2 text-base leading-tight">
                          {event.name}
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">
                          {event.shortName}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Date & Time */}
                        <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                          <Calendar className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {format(new Date(event.date), 'EEEE, MMM d')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(event.date), 'h:mm a')}
                            </p>
                          </div>
                        </div>

                        {/* Venue */}
                        {venue && (
                          <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                            <MapPin className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">
                                {venue.fullName}
                              </p>
                              {venue.address && (
                                <p className="text-xs text-muted-foreground">
                                  {venue.address.city}, {venue.address.state}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Import Button */}
                        <Button
                          size="sm"
                          className={cn(
                            'w-full gap-2 transition-all',
                            isImported
                              ? 'bg-accent hover:bg-accent/90'
                              : cn('bg-gradient-to-r text-white border-0', selectedSportData.gradient)
                          )}
                          onClick={() => handleImportEvent(event, selectedSport)}
                          disabled={isImporting || isImported}
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Importing...
                            </>
                          ) : isImported ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Imported
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              Import to Dashboard
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty State - Initial */}
        {!selectedSport && !loading && (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20 p-12 text-center animate-fade-in">
            <div className="mx-auto max-w-md space-y-4">
              <div className="flex justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl animate-bounce">
                  🏀
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl animate-bounce [animation-delay:100ms]">
                  🏈
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl animate-bounce [animation-delay:200ms]">
                  ⚾
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl animate-bounce [animation-delay:300ms]">
                  🏒
                </div>
              </div>
              <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to Discover</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a sport above to browse official events from ESPN and add them to
                  your dashboard with one click
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
