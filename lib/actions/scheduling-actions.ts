'use server';

import { db } from '@/lib/db';
import { leagues, teams, events, League, Team, Event, Venue } from '@/lib/db/schema';
import { createAuthenticatedAction, ActionResult } from './action-helpers';
import {
  CreateLeagueSchema,
  UpdateLeagueSchema,
  DeleteLeagueSchema,
  AddTeamSchema,
  RemoveTeamSchema,
  GenerateScheduleSchema,
  RecordMatchResultSchema,
} from '@/lib/validation/schemas';
import { eq, and, desc, asc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { addWeeks } from 'date-fns';
import { generateRoundRobinPairings, generateSingleEliminationBracket } from '@/lib/utils/round-robin';

export type LeagueWithTeams = League & { teams: Team[] };
export type LeagueScheduleEvent = Event & { venues: Venue[]; homeTeam: Team | null; awayTeam: Team | null };

// ── Create League ──────────────────────────────────────────────────────────

export const createLeague = createAuthenticatedAction(
  CreateLeagueSchema,
  async (input, userId) => {
    const seasonStart = typeof input.seasonStart === 'string' ? new Date(input.seasonStart) : input.seasonStart;
    const seasonEnd = typeof input.seasonEnd === 'string' ? new Date(input.seasonEnd) : input.seasonEnd;

    const [league] = await db
      .insert(leagues)
      .values({
        name: input.name,
        sportType: input.sportType,
        userId,
        seasonStart,
        seasonEnd,
        scheduleType: input.scheduleType,
      })
      .returning();

    // Create teams
    const teamValues = input.teamNames.map((name) => ({
      leagueId: league.id,
      name,
    }));

    const newTeams = await db.insert(teams).values(teamValues).returning();

    revalidatePath('/dashboard');
    return { ...league, teams: newTeams };
  }
);

// ── Add Team ───────────────────────────────────────────────────────────────

export const addTeam = createAuthenticatedAction(
  AddTeamSchema,
  async (input, userId) => {
    const league = await db.query.leagues.findFirst({
      where: and(eq(leagues.id, input.leagueId), eq(leagues.userId, userId)),
    });

    if (!league) throw new Error('League not found or unauthorized');

    const [team] = await db
      .insert(teams)
      .values({ leagueId: input.leagueId, name: input.name })
      .returning();

    revalidatePath('/dashboard');
    return team;
  }
);

// ── Remove Team ────────────────────────────────────────────────────────────

export const removeTeam = createAuthenticatedAction(
  RemoveTeamSchema,
  async (input, userId) => {
    const team = await db.query.teams.findFirst({
      where: eq(teams.id, input.id),
      with: { league: true },
    });

    if (!team || (team.league as League).userId !== userId) {
      throw new Error('Team not found or unauthorized');
    }

    await db.delete(teams).where(eq(teams.id, input.id));

    revalidatePath('/dashboard');
    return { id: input.id };
  }
);

// ── Generate Schedule ──────────────────────────────────────────────────────

export const generateSchedule = createAuthenticatedAction(
  GenerateScheduleSchema,
  async (input, userId) => {
    const league = await db.query.leagues.findFirst({
      where: and(eq(leagues.id, input.leagueId), eq(leagues.userId, userId)),
      with: { teams: true },
    });

    if (!league) throw new Error('League not found or unauthorized');

    const leagueTeams = league.teams as Team[];
    if (leagueTeams.length < 2) throw new Error('Need at least 2 teams');

    const teamIds = leagueTeams.map((t) => t.id);
    let rounds: [string, string][][];

    if (league.scheduleType === 'round_robin') {
      rounds = generateRoundRobinPairings(teamIds);
    } else {
      rounds = generateSingleEliminationBracket(teamIds);
    }

    // Delete existing league events
    const existingEvents = await db.query.events.findMany({
      where: eq(events.leagueId, league.id),
    });
    for (const event of existingEvents) {
      await db.delete(events).where(eq(events.id, event.id));
    }

    // Create events for each match
    const createdEvents: (Event & { venues: Venue[] })[] = [];
    const startDate = new Date(league.seasonStart);
    const isSingleElim = league.scheduleType === 'single_elimination' || league.scheduleType === 'double_elimination';

    for (let roundIdx = 0; roundIdx < rounds.length; roundIdx++) {
      const roundDate = addWeeks(startDate, roundIdx);

      for (let matchIdx = 0; matchIdx < rounds[roundIdx].length; matchIdx++) {
        const [homeId, awayId] = rounds[roundIdx][matchIdx];

        // For round-robin, skip byes entirely
        if (!isSingleElim && (homeId === '__bye__' || awayId === '__bye__')) continue;

        // For single elimination: create ALL events including TBD placeholders
        const isTbd = homeId === '__tbd__' || awayId === '__tbd__';
        const isBye = homeId === '__bye__' || awayId === '__bye__';

        // Skip byes in elimination too (auto-advance handled below)
        if (isSingleElim && isBye && !isTbd) {
          // Auto-advance: the non-bye team advances
          const realTeamId = homeId === '__bye__' ? awayId : homeId;
          const home = leagueTeams.find((t) => t.id === realTeamId);

          // Create event as already completed with bye winner
          const [newEvent] = await db
            .insert(events)
            .values({
              name: `${home?.name ?? 'TBD'} (bye)`,
              sportType: league.sportType,
              date: roundDate,
              userId,
              status: 'completed',
              leagueId: league.id,
              homeTeamId: realTeamId,
              awayTeamId: null,
              winnerId: realTeamId,
              roundNumber: roundIdx + 1,
              matchIndex: matchIdx,
            })
            .returning();

          createdEvents.push({ ...newEvent, venues: [] });
          continue;
        }

        const resolvedHomeId = (homeId === '__tbd__' || homeId === '__bye__') ? null : homeId;
        const resolvedAwayId = (awayId === '__tbd__' || awayId === '__bye__') ? null : awayId;

        const home = resolvedHomeId ? leagueTeams.find((t) => t.id === resolvedHomeId) : null;
        const away = resolvedAwayId ? leagueTeams.find((t) => t.id === resolvedAwayId) : null;

        const [newEvent] = await db
          .insert(events)
          .values({
            name: `${home?.name ?? 'TBD'} vs ${away?.name ?? 'TBD'}`,
            sportType: league.sportType,
            date: roundDate,
            userId,
            status: 'draft',
            leagueId: league.id,
            homeTeamId: resolvedHomeId,
            awayTeamId: resolvedAwayId,
            roundNumber: isSingleElim ? roundIdx + 1 : null,
            matchIndex: isSingleElim ? matchIdx : null,
          })
          .returning();

        createdEvents.push({ ...newEvent, venues: [] });
      }
    }

    // For single elimination, auto-advance bye winners to next round
    if (isSingleElim) {
      for (const ev of createdEvents) {
        if (ev.status === 'completed' && ev.winnerId && ev.roundNumber && ev.matchIndex !== null) {
          await advanceWinner(ev.winnerId, ev.leagueId!, ev.roundNumber, ev.matchIndex, leagueTeams);
        }
      }
    }

    revalidatePath('/dashboard');
    return createdEvents;
  }
);

// ── Record Match Result ────────────────────────────────────────────────────

export const recordMatchResult = createAuthenticatedAction(
  RecordMatchResultSchema,
  async (input, userId) => {
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, input.eventId), eq(events.userId, userId)),
      with: { homeTeam: true, awayTeam: true, league: true },
    });

    if (!event) throw new Error('Event not found or unauthorized');
    if (!event.homeTeamId || !event.awayTeamId) throw new Error('Both teams must be set before recording a result');

    // Determine winner from scores if not explicit
    let winnerId = input.winnerId ?? null;
    if (!winnerId) {
      if (input.homeScore > input.awayScore) winnerId = event.homeTeamId;
      else if (input.awayScore > input.homeScore) winnerId = event.awayTeamId;
      // Tie: no winner set
    }

    // Update event
    const [updated] = await db
      .update(events)
      .set({
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        winnerId,
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(events.id, input.eventId))
      .returning();

    // Advance winner in single elimination
    if (winnerId && event.leagueId && event.roundNumber && event.matchIndex !== null) {
      const league = await db.query.leagues.findFirst({
        where: eq(leagues.id, event.leagueId),
        with: { teams: true },
      });
      if (league && (league.scheduleType === 'single_elimination' || league.scheduleType === 'double_elimination')) {
        await advanceWinner(winnerId, event.leagueId, event.roundNumber, event.matchIndex, league.teams as Team[]);
      }
    }

    revalidatePath('/dashboard');
    return updated;
  }
);

// ── Advance Winner (internal helper) ────────────────────────────────────────

async function advanceWinner(
  winnerId: string,
  leagueId: string,
  roundNumber: number,
  matchIndex: number,
  leagueTeams: Team[],
) {
  const nextRound = roundNumber + 1;
  const nextMatchIndex = Math.floor(matchIndex / 2);
  const isHomeSlot = matchIndex % 2 === 0;

  // Find next round event
  const nextEvent = await db.query.events.findFirst({
    where: and(
      eq(events.leagueId, leagueId),
      eq(events.roundNumber, nextRound),
      eq(events.matchIndex, nextMatchIndex),
    ),
  });

  if (!nextEvent) return; // Finals winner, no next match

  const winnerTeam = leagueTeams.find((t) => t.id === winnerId);
  const updates: Record<string, unknown> = { updatedAt: new Date() };

  if (isHomeSlot) {
    updates.homeTeamId = winnerId;
  } else {
    updates.awayTeamId = winnerId;
  }

  // Update event name
  const currentHome = isHomeSlot ? winnerTeam?.name : (nextEvent.homeTeamId ? leagueTeams.find(t => t.id === nextEvent.homeTeamId)?.name : null);
  const currentAway = !isHomeSlot ? winnerTeam?.name : (nextEvent.awayTeamId ? leagueTeams.find(t => t.id === nextEvent.awayTeamId)?.name : null);
  updates.name = `${currentHome ?? 'TBD'} vs ${currentAway ?? 'TBD'}`;

  await db.update(events).set(updates).where(eq(events.id, nextEvent.id));
}

// ── Get League Standings (Round Robin) ──────────────────────────────────────

export async function getLeagueStandings(
  leagueId: string
): Promise<ActionResult<StandingRow[]>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const league = await db.query.leagues.findFirst({
      where: and(eq(leagues.id, leagueId), eq(leagues.userId, user.id)),
      with: { teams: true },
    });

    if (!league) return { success: false, error: 'League not found' };

    const leagueEvents = await db.query.events.findMany({
      where: and(eq(events.leagueId, leagueId), eq(events.status, 'completed')),
    });

    const leagueTeams = league.teams as Team[];
    const standingsMap = new Map<string, StandingRow>();

    for (const team of leagueTeams) {
      standingsMap.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        wins: 0,
        losses: 0,
        draws: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        diff: 0,
      });
    }

    for (const ev of leagueEvents) {
      if (!ev.homeTeamId || !ev.awayTeamId || ev.homeScore === null || ev.awayScore === null) continue;

      const homeRow = standingsMap.get(ev.homeTeamId);
      const awayRow = standingsMap.get(ev.awayTeamId);
      if (!homeRow || !awayRow) continue;

      homeRow.pointsFor += ev.homeScore;
      homeRow.pointsAgainst += ev.awayScore;
      awayRow.pointsFor += ev.awayScore;
      awayRow.pointsAgainst += ev.homeScore;

      if (ev.homeScore > ev.awayScore) {
        homeRow.wins++;
        awayRow.losses++;
      } else if (ev.awayScore > ev.homeScore) {
        awayRow.wins++;
        homeRow.losses++;
      } else {
        homeRow.draws++;
        awayRow.draws++;
      }
    }

    const standings = Array.from(standingsMap.values()).map(row => ({
      ...row,
      diff: row.pointsFor - row.pointsAgainst,
    }));

    standings.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.diff !== a.diff) return b.diff - a.diff;
      return b.pointsFor - a.pointsFor;
    });

    return { success: true, data: standings };
  } catch (error) {
    console.error('Get standings error:', error);
    return { success: false, error: 'Failed to fetch standings' };
  }
}

export interface StandingRow {
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  draws: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
}

// ── Get Leagues ────────────────────────────────────────────────────────────

export async function getLeagues(): Promise<ActionResult<LeagueWithTeams[]>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await db.query.leagues.findMany({
      where: eq(leagues.userId, user.id),
      with: { teams: true },
      orderBy: [desc(leagues.createdAt)],
    });

    return { success: true, data: result as LeagueWithTeams[] };
  } catch (error) {
    console.error('Get leagues error:', error);
    return { success: false, error: 'Failed to fetch leagues' };
  }
}

// ── Get League by ID ───────────────────────────────────────────────────────

export async function getLeagueById(
  id: string
): Promise<ActionResult<LeagueWithTeams>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const league = await db.query.leagues.findFirst({
      where: and(eq(leagues.id, id), eq(leagues.userId, user.id)),
      with: { teams: true },
    });

    if (!league) {
      return { success: false, error: 'League not found' };
    }

    return { success: true, data: league as LeagueWithTeams };
  } catch (error) {
    console.error('Get league error:', error);
    return { success: false, error: 'Failed to fetch league' };
  }
}

// ── Get League Schedule ────────────────────────────────────────────────────

export async function getLeagueSchedule(
  leagueId: string
): Promise<ActionResult<LeagueScheduleEvent[]>> {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const result = await db.query.events.findMany({
      where: and(eq(events.leagueId, leagueId), eq(events.userId, user.id)),
      with: {
        venues: true,
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: [asc(events.date)],
    });

    return { success: true, data: result as LeagueScheduleEvent[] };
  } catch (error) {
    console.error('Get league schedule error:', error);
    return { success: false, error: 'Failed to fetch schedule' };
  }
}

// ── Update League ──────────────────────────────────────────────────────────

export const updateLeague = createAuthenticatedAction(
  UpdateLeagueSchema,
  async (input, userId) => {
    const existing = await db.query.leagues.findFirst({
      where: and(eq(leagues.id, input.id), eq(leagues.userId, userId)),
    });

    if (!existing) throw new Error('League not found or unauthorized');

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.name) updates.name = input.name;
    if (input.sportType) updates.sportType = input.sportType;
    if (input.seasonStart) {
      updates.seasonStart = typeof input.seasonStart === 'string' ? new Date(input.seasonStart) : input.seasonStart;
    }
    if (input.seasonEnd) {
      updates.seasonEnd = typeof input.seasonEnd === 'string' ? new Date(input.seasonEnd) : input.seasonEnd;
    }

    const [updated] = await db
      .update(leagues)
      .set(updates)
      .where(eq(leagues.id, input.id))
      .returning();

    revalidatePath('/dashboard');
    return updated;
  }
);

// ── Delete League ──────────────────────────────────────────────────────────

export const deleteLeague = createAuthenticatedAction(
  DeleteLeagueSchema,
  async (input, userId) => {
    const existing = await db.query.leagues.findFirst({
      where: and(eq(leagues.id, input.id), eq(leagues.userId, userId)),
    });

    if (!existing) throw new Error('League not found or unauthorized');

    // Delete associated events
    const leagueEvents = await db.query.events.findMany({
      where: eq(events.leagueId, input.id),
    });
    for (const event of leagueEvents) {
      await db.delete(events).where(eq(events.id, event.id));
    }

    await db.delete(leagues).where(eq(leagues.id, input.id));

    revalidatePath('/dashboard');
    return { id: input.id };
  }
);
