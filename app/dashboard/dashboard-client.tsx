'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { type User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, LogOut } from 'lucide-react';
import { EventCard } from '@/components/events/event-card';
import { EventFormDialog } from '@/components/events/event-form-dialog';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface DashboardClientProps {
  initialEvents: EventWithVenues[];
  user: User;
  initialSearch?: string;
  initialSportType?: string;
}

export function DashboardClient({
  initialEvents,
  user,
  initialSearch = '',
  initialSportType = '',
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [sportType, setSportType] = useState(initialSportType);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sportType) params.set('sportType', sportType);

    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('Failed to sign out');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Fastbreak Event Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
            <Input
              placeholder="Filter by sport..."
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full sm:w-48"
            />
            <Button onClick={handleSearch} disabled={isPending}>
              Filter
            </Button>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Events Grid */}
        {initialEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">No events found</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {search || sportType
                ? 'Try adjusting your search filters'
                : 'Get started by creating your first event'}
            </p>
            {!search && !sportType && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {initialEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>

      {/* Create Event Dialog */}
      <EventFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        mode="create"
      />
    </div>
  );
}
