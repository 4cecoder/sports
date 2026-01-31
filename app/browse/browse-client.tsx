'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { PublicHeader } from '@/components/public/public-header';
import { PublicEventCard } from '@/components/public/public-event-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface BrowseClientProps {
  events: EventWithVenues[];
  total: number;
  currentPage: number;
  initialSearch?: string;
  initialSportType?: string;
}

export function BrowseClient({ events, total, currentPage, initialSearch = '', initialSportType = '' }: BrowseClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (initialSportType) params.set('sportType', initialSportType);
    startTransition(() => { router.push(`/browse?${params.toString()}`); });
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Events</h1>
          <p className="text-muted-foreground">Discover upcoming sports events and book your spot</p>
        </div>

        <div className="flex gap-2 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} disabled={isPending}>
            <Search className="h-4 w-4 mr-2" /> Search
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground">Try a different search or check back later</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <PublicEventCard key={event.id} event={event} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {currentPage > 1 && (
                  <Button variant="outline" onClick={() => {
                    const params = new URLSearchParams();
                    if (search) params.set('search', search);
                    params.set('page', String(currentPage - 1));
                    startTransition(() => { router.push(`/browse?${params.toString()}`); });
                  }}>Previous</Button>
                )}
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Button variant="outline" onClick={() => {
                    const params = new URLSearchParams();
                    if (search) params.set('search', search);
                    params.set('page', String(currentPage + 1));
                    startTransition(() => { router.push(`/browse?${params.toString()}`); });
                  }}>Next</Button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
