'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { type User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, LogOut, Compass } from 'lucide-react';
import { EventCard } from '@/components/events/event-card';
import { EventFormDialog } from '@/components/events/event-form-dialog';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

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
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold md:text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Fastbreak Event Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, <span className="font-medium text-foreground">{user.email}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Link href="/discover">
                <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground hover:border-primary">
                  <Compass className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Discover</span>
                </Button>
              </Link>
              <Button variant="outline" onClick={handleSignOut} className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive">
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Search and Filter Bar */}
        <div className="mb-6 animate-fade-in">
          <div className="rounded-lg border border-border/50 bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search events by name or description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9 border-border/50 focus:border-primary"
                  />
                </div>
                <Input
                  placeholder="Sport type..."
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full sm:w-40 border-border/50 focus:border-primary"
                />
                <Button
                  onClick={handleSearch}
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Search className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Filter</span>
                </Button>
              </div>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="gradient-blue-green hover:opacity-90 transition-opacity"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {initialEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-muted/10 p-12 text-center animate-fade-in">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">No events found</h3>
            <p className="mb-6 text-sm text-muted-foreground max-w-sm">
              {search || sportType
                ? 'Try adjusting your search filters to find what you are looking for'
                : 'Get started by creating your first sports event with venue information'}
            </p>
            {!search && !sportType && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                size="lg"
                className="gradient-blue-green hover:opacity-90"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
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
