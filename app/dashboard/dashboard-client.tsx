'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type EventWithVenues } from '@/lib/actions/event-actions';
import { type EventTemplate } from '@/lib/db/schema';
import { type RecurrenceRule } from '@/lib/db/schema';
import { type User } from '@supabase/supabase-js';
import { type LeagueWithTeams } from '@/lib/actions/scheduling-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, LogOut, Compass, Download } from 'lucide-react';
import { EventCard } from '@/components/events/event-card';
import { EventListItem } from '@/components/events/event-list-item';
import { EventCalendar } from '@/components/events/event-calendar';
import { EventFormDialog } from '@/components/events/event-form-dialog';
import { ExportCalendarDialog } from '@/components/events/export-calendar-dialog';
import { TemplateCard } from '@/components/templates/template-card';
import { TemplateFormDialog } from '@/components/templates/template-form-dialog';
import { RecurrenceRuleCard } from '@/components/recurring/recurrence-rule-card';
import { RecurrenceFormDialog } from '@/components/recurring/recurrence-form-dialog';
import { LeagueCard } from '@/components/scheduling/league-card';
import { LeagueFormDialog } from '@/components/scheduling/league-form-dialog';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ViewSwitcher } from '@/components/view-switcher';
import { useViewPreference } from '@/hooks/use-view-preference';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface DashboardClientProps {
  initialEvents: EventWithVenues[];
  user: User;
  initialSearch?: string;
  initialSportType?: string;
  initialStatus?: string;
  availableSportTypes: string[];
  templates: EventTemplate[];
  recurrenceRules: RecurrenceRule[];
  leagues: LeagueWithTeams[];
}

export function DashboardClient({
  initialEvents,
  user,
  initialSearch = '',
  initialSportType = '',
  initialStatus = '',
  availableSportTypes,
  templates,
  recurrenceRules,
  leagues,
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [sportType, setSportType] = useState(initialSportType);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTemplateCreateOpen, setIsTemplateCreateOpen] = useState(false);
  const [isRecurrenceCreateOpen, setIsRecurrenceCreateOpen] = useState(false);
  const [isLeagueCreateOpen, setIsLeagueCreateOpen] = useState(false);
  const [view, setView] = useViewPreference('grid');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (sportType) params.set('sportType', sportType);
    if (statusFilter) params.set('status', statusFilter);

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
            <div className="flex-1 flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Fastbreak Logo"
                width={40}
                height={40}
                className="flex-shrink-0"
              />
              <div>
                <h1 className="text-2xl font-bold md:text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Fastbreak Event Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome back, <span className="font-medium text-foreground">{user.email}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Link href="/browse">
                <Button variant="outline" size="sm">
                  <Compass className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">Browse</span>
                </Button>
              </Link>
              <Link href="/discover">
                <Button className="gradient-blue-green hover:opacity-90 transition-opacity">
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
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="recurring">Recurring</TabsTrigger>
            <TabsTrigger value="leagues">Leagues</TabsTrigger>
          </TabsList>

          {/* ── Events Tab ──────────────────────────────────────────── */}
          <TabsContent value="events" className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="animate-fade-in">
              <div className="rounded-lg border border-border/50 bg-card p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex flex-1 gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search events..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-9 border-border/50 focus:border-primary"
                      />
                    </div>
                    <Select
                      value={sportType || "all"}
                      onValueChange={(value) => {
                        const newSportType = value === "all" ? "" : value;
                        setSportType(newSportType);
                        const params = new URLSearchParams();
                        if (search) params.set('search', search);
                        if (newSportType) params.set('sportType', newSportType);
                        if (statusFilter) params.set('status', statusFilter);
                        startTransition(() => {
                          router.push(`/dashboard?${params.toString()}`);
                        });
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-40 border-border/50">
                        <SelectValue placeholder="All sports" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All sports</SelectItem>
                        {availableSportTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={statusFilter || "all_statuses"}
                      onValueChange={(value) => {
                        const newStatus = value === "all_statuses" ? "" : value;
                        setStatusFilter(newStatus);
                        const params = new URLSearchParams();
                        if (search) params.set('search', search);
                        if (sportType) params.set('sportType', sportType);
                        if (newStatus) params.set('status', newStatus);
                        startTransition(() => {
                          router.push(`/dashboard?${params.toString()}`);
                        });
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-40 border-border/50">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_statuses">All statuses</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="postponed">Postponed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} disabled={isPending} className="bg-primary hover:bg-primary/90">
                      <Search className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Filter</span>
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <ViewSwitcher view={view} onViewChange={setView} />
                    <ExportCalendarDialog availableSportTypes={availableSportTypes} />
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
            </div>

            {/* Events Display */}
            {initialEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-muted/10 p-12 text-center animate-fade-in">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">No events found</h3>
                <p className="mb-6 text-sm text-muted-foreground max-w-sm">
                  {search || sportType || statusFilter
                    ? 'Try adjusting your search filters'
                    : 'Get started by creating your first sports event'}
                </p>
                {!search && !sportType && !statusFilter && (
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
            ) : view === 'grid' ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                {initialEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : view === 'list' ? (
              <div className="flex flex-col gap-4 animate-fade-in">
                {initialEvents.map((event) => (
                  <EventListItem key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="animate-fade-in">
                <EventCalendar events={initialEvents} />
              </div>
            )}
          </TabsContent>

          {/* ── Templates Tab ───────────────────────────────────────── */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Event Templates</h2>
                <p className="text-sm text-muted-foreground">Save and reuse event configurations</p>
              </div>
              <Button onClick={() => setIsTemplateCreateOpen(true)} className="gradient-blue-green hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>

            {templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-muted/10 p-12 text-center">
                <h3 className="mb-2 text-lg font-semibold">No templates yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">Create templates to quickly set up recurring event types</p>
                <Button onClick={() => setIsTemplateCreateOpen(true)} className="gradient-blue-green hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" /> Create Template
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Recurring Tab ───────────────────────────────────────── */}
          <TabsContent value="recurring" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recurring Events</h2>
                <p className="text-sm text-muted-foreground">Automatically generate events on a schedule</p>
              </div>
              <Button onClick={() => setIsRecurrenceCreateOpen(true)} className="gradient-blue-green hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Create Rule
              </Button>
            </div>

            {recurrenceRules.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-muted/10 p-12 text-center">
                <h3 className="mb-2 text-lg font-semibold">No recurrence rules</h3>
                <p className="mb-4 text-sm text-muted-foreground">Set up rules to auto-generate events on a schedule</p>
                <Button onClick={() => setIsRecurrenceCreateOpen(true)} className="gradient-blue-green hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" /> Create Rule
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recurrenceRules.map((rule) => (
                  <RecurrenceRuleCard key={rule.id} rule={rule} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Leagues Tab ─────────────────────────────────────────── */}
          <TabsContent value="leagues" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Leagues & Scheduling</h2>
                <p className="text-sm text-muted-foreground">Manage leagues, teams, and auto-generate schedules</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/leagues/import">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Import ESPN
                  </Button>
                </Link>
                <Button onClick={() => setIsLeagueCreateOpen(true)} className="gradient-blue-green hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create League
                </Button>
              </div>
            </div>

            {leagues.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/50 bg-muted/10 p-12 text-center">
                <h3 className="mb-2 text-lg font-semibold">No leagues yet</h3>
                <p className="mb-4 text-sm text-muted-foreground">Create a league with teams and auto-generate schedules</p>
                <Button onClick={() => setIsLeagueCreateOpen(true)} className="gradient-blue-green hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" /> Create League
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {leagues.map((league) => (
                  <LeagueCard key={league.id} league={league} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <EventFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} mode="create" />
      <TemplateFormDialog open={isTemplateCreateOpen} onOpenChange={setIsTemplateCreateOpen} mode="create" />
      <RecurrenceFormDialog open={isRecurrenceCreateOpen} onOpenChange={setIsRecurrenceCreateOpen} />
      <LeagueFormDialog open={isLeagueCreateOpen} onOpenChange={setIsLeagueCreateOpen} />
    </div>
  );
}
