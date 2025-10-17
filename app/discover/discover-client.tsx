'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Dumbbell,
  CircleDot,
  IceCream2,
  Calendar,
  MapPin,
  Download,
  Loader2,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { fetchESPNEvents, importESPNEvent, type SportType } from '@/lib/actions/external-events';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

const sports = [
  { id: 'nba' as SportType, name: 'NBA', icon: CircleDot, color: 'text-orange-500' },
  { id: 'nfl' as SportType, name: 'NFL', icon: Dumbbell, color: 'text-green-500' },
  { id: 'mlb' as SportType, name: 'MLB', icon: CircleDot, color: 'text-blue-500' },
  { id: 'nhl' as SportType, name: 'NHL', icon: IceCream2, color: 'text-cyan-500' },
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
      toast.success(`Loaded ${result.data.length} ${sport.toUpperCase()} events`);
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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold md:text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Discover Events
            </h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Back to Dashboard</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Sport Selection */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Select a Sport</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sports.map((sport) => {
              const Icon = sport.icon;
              return (
                <Card
                  key={sport.id}
                  className={`cursor-pointer glow-hover transition-all ${
                    selectedSport === sport.id
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/50 hover:border-primary/30'
                  }`}
                  onClick={() => handleSportSelect(sport.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Icon className={`h-8 w-8 ${sport.color}`} />
                      {selectedSport === sport.id && loading && (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-lg">{sport.name}</CardTitle>
                    <CardDescription className="text-sm">
                      Browse {sport.name} events
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Event List */}
        {selectedSport && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {selectedSport.toUpperCase()} Events
              </h2>
              <p className="text-sm text-muted-foreground">
                {events.length} events available
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground">Loading events...</p>
                </div>
              </div>
            ) : events.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="flex min-h-[400px] items-center justify-center">
                  <div className="text-center">
                    <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">
                      No events found for {selectedSport.toUpperCase()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const venue = event.competitions[0]?.venue;
                  const isImporting = importingEventIds.has(event.id);
                  const isImported = importedEventIds.has(event.id);

                  return (
                    <Card key={event.id} className="glow-hover flex flex-col border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="line-clamp-2 text-base">
                          {event.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {event.shortName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2 text-muted-foreground">
                            <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="line-clamp-1">
                              {format(new Date(event.date), 'PPP p')}
                            </span>
                          </div>
                          {venue && (
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                              <div className="line-clamp-2">
                                <div className="font-medium">{venue.fullName}</div>
                                {venue.address && (
                                  <div className="text-xs">
                                    {venue.address.city}, {venue.address.state}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="w-full gap-2"
                          onClick={() => handleImportEvent(event, selectedSport)}
                          disabled={isImporting || isImported}
                          variant={isImported ? 'outline' : 'default'}
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
                              Import Event
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {!selectedSport && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Trophy className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">Select a Sport to Get Started</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a sport above to discover official events from ESPN
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
