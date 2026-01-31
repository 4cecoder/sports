'use server';

import { db } from '@/lib/db';
import { leagues, teams, events, Team } from '@/lib/db/schema';
import { createAuthenticatedAction, ActionResult } from './action-helpers';
import {
  ImportESPNBracketSchema,
  SimulateBracketPickSchema,
  SyncESPNResultsSchema,
} from '@/lib/validation/schemas';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { sportPaths, sportDisplayNames, type SportType } from '@/lib/constants/sports';

// ── ESPN API Types ──────────────────────────────────────────────────────────

interface ESPNCompetitor {
  id: string;
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
  };
  score?: string;
  winner?: boolean;
}

interface ESPNCompetition {
  id: string;
  competitors: ESPNCompetitor[];
  status: {
    type: {
      completed: boolean;
      description: string;
    };
  };
  series?: {
    title?: string;
  };
}

interface ESPNPlayoffEvent {
  id: string;
  name: string;
  shortName: string;
  date: string;
  competitions: ESPNCompetition[];
}

interface ESPNPlayoffResponse {
  events: ESPNPlayoffEvent[];
}

export interface ParsedBracketGame {
  externalId: string;
  name: string;
  date: string;
  homeTeam: {
    externalId: string;
    name: string;
    score?: number;
    winner?: boolean;
  };
  awayTeam: {
    externalId: string;
    name: string;
    score?: number;
    winner?: boolean;
  };
  round: number;
  matchIndex: number;
  status: 'scheduled' | 'in_progress' | 'completed';
}

// ── Fetch ESPN Playoffs ────────────────────────────────────────────────────

export async function fetchESPNPlayoffs(
  sport: SportType,
): Promise<ActionResult<ParsedBracketGame[]>> {
  try {
    const path = sportPaths[sport];
    if (!path) return { success: false, error: `Unsupported sport: ${sport}` };

    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard?seasontype=3`,
      { cache: 'no-store' },
    );

    if (!response.ok) {
      return { success: false, error: `ESPN API returned ${response.status}` };
    }

    const data = (await response.json()) as ESPNPlayoffResponse;

    if (!data.events || data.events.length === 0) {
      return { success: false, error: 'No playoff events found for this sport' };
    }

    // Parse events into bracket games
    const games: ParsedBracketGame[] = [];

    // Sort by date to assign rounds
    const sortedEvents = [...data.events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Group by date bucket to detect rounds
    const dateBuckets = new Map<string, ESPNPlayoffEvent[]>();
    for (const ev of sortedEvents) {
      const dateKey = new Date(ev.date).toISOString().slice(0, 10);
      if (!dateBuckets.has(dateKey)) dateBuckets.set(dateKey, []);
      dateBuckets.get(dateKey)!.push(ev);
    }

    // Try to detect rounds from series title, else use date grouping
    const roundDates = Array.from(dateBuckets.keys()).sort();
    let roundCounter = 0;
    const dateToRound = new Map<string, number>();
    let lastRound = -1;

    for (const dateKey of roundDates) {
      const eventsOnDate = dateBuckets.get(dateKey)!;
      // Check if any event has series info
      const seriesTitle = eventsOnDate[0]?.competitions?.[0]?.series?.title;
      let roundNum = roundCounter + 1;

      if (seriesTitle) {
        // Try to parse round from series title
        const roundMatch = seriesTitle.match(/round\s+(\d+)/i) || seriesTitle.match(/(\d+)(?:st|nd|rd|th)\s+round/i);
        if (roundMatch) {
          roundNum = parseInt(roundMatch[1], 10);
        } else if (seriesTitle.toLowerCase().includes('final')) {
          roundNum = lastRound + 1;
        } else if (seriesTitle.toLowerCase().includes('semifinal') || seriesTitle.toLowerCase().includes('semi-final')) {
          roundNum = lastRound + 1;
        }
      }

      if (roundNum <= lastRound) {
        roundNum = lastRound; // Same round on different date
      }

      dateToRound.set(dateKey, roundNum);
      lastRound = roundNum;
      roundCounter = roundNum;
    }

    // Assign match indices within each round
    const roundMatchCounters = new Map<number, number>();

    for (const ev of sortedEvents) {
      const comp = ev.competitions?.[0];
      if (!comp || comp.competitors.length < 2) continue;

      const dateKey = new Date(ev.date).toISOString().slice(0, 10);
      const round = dateToRound.get(dateKey) ?? 1;

      if (!roundMatchCounters.has(round)) roundMatchCounters.set(round, 0);
      const matchIndex = roundMatchCounters.get(round)!;
      roundMatchCounters.set(round, matchIndex + 1);

      const home = comp.competitors.find((c) => c.team) ?? comp.competitors[0];
      const away = comp.competitors.find((c) => c !== home) ?? comp.competitors[1];

      const statusCompleted = comp.status.type.completed;
      const statusDesc = comp.status.type.description.toLowerCase();
      let status: 'scheduled' | 'in_progress' | 'completed' = 'scheduled';
      if (statusCompleted) status = 'completed';
      else if (statusDesc.includes('progress') || statusDesc.includes('halftime')) status = 'in_progress';

      games.push({
        externalId: ev.id,
        name: ev.name,
        date: ev.date,
        homeTeam: {
          externalId: home.team.id,
          name: home.team.displayName,
          score: home.score ? parseInt(home.score, 10) : undefined,
          winner: home.winner,
        },
        awayTeam: {
          externalId: away.team.id,
          name: away.team.displayName,
          score: away.score ? parseInt(away.score, 10) : undefined,
          winner: away.winner,
        },
        round,
        matchIndex,
        status,
      });
    }

    return { success: true, data: games };
  } catch (error) {
    console.error('ESPN Playoffs fetch error:', error);
    return { success: false, error: 'Failed to fetch ESPN playoff data' };
  }
}

// ── Import ESPN Bracket ────────────────────────────────────────────────────

export const importESPNBracket = createAuthenticatedAction(
  ImportESPNBracketSchema,
  async (input, userId) => {
    const sport = input.sport as SportType;
    const displayName = sportDisplayNames[sport] ?? input.sport;

    // Create league
    const [league] = await db
      .insert(leagues)
      .values({
        name: input.leagueName,
        sportType: displayName,
        userId,
        seasonStart: new Date(),
        seasonEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // +90 days
        scheduleType: 'single_elimination',
        externalSource: 'ESPN',
        externalId: `${sport}_playoffs`,
        lastSyncedAt: new Date(),
      })
      .returning();

    // Collect unique teams and create them (deduped by ESPN ID)
    const teamMap = new Map<string, string>(); // espnId -> dbId
    const allTeamEntries: { externalId: string; name: string }[] = [];

    for (const game of input.games) {
      if (!teamMap.has(game.homeTeam.externalId)) {
        allTeamEntries.push({ externalId: game.homeTeam.externalId, name: game.homeTeam.name });
        teamMap.set(game.homeTeam.externalId, '');
      }
      if (!teamMap.has(game.awayTeam.externalId)) {
        allTeamEntries.push({ externalId: game.awayTeam.externalId, name: game.awayTeam.name });
        teamMap.set(game.awayTeam.externalId, '');
      }
    }

    for (const entry of allTeamEntries) {
      const [team] = await db
        .insert(teams)
        .values({
          leagueId: league.id,
          name: entry.name,
          externalId: entry.externalId,
          externalSource: 'ESPN',
        })
        .returning();
      teamMap.set(entry.externalId, team.id);
    }

    // Create events
    for (const game of input.games) {
      const homeTeamId = teamMap.get(game.homeTeam.externalId) ?? null;
      const awayTeamId = teamMap.get(game.awayTeam.externalId) ?? null;

      const isCompleted = game.status === 'completed';
      let winnerId: string | null = null;
      if (isCompleted) {
        if (game.homeTeam.winner) winnerId = homeTeamId;
        else if (game.awayTeam.winner) winnerId = awayTeamId;
        else if (game.homeTeam.score !== undefined && game.awayTeam.score !== undefined) {
          winnerId = game.homeTeam.score > game.awayTeam.score ? homeTeamId : awayTeamId;
        }
      }

      await db.insert(events).values({
        name: game.name,
        sportType: displayName,
        date: new Date(game.date),
        userId,
        status: isCompleted ? 'completed' : 'draft',
        leagueId: league.id,
        homeTeamId,
        awayTeamId,
        homeScore: game.homeTeam.score ?? null,
        awayScore: game.awayTeam.score ?? null,
        winnerId,
        roundNumber: game.round,
        matchIndex: game.matchIndex,
        externalSource: 'ESPN',
        externalId: game.externalId,
      });
    }

    revalidatePath('/dashboard');
    return { leagueId: league.id, teamsCreated: teamMap.size, gamesCreated: input.games.length };
  },
);

// ── Sync ESPN Results ──────────────────────────────────────────────────────

export const syncESPNResults = createAuthenticatedAction(
  SyncESPNResultsSchema,
  async (input, userId) => {
    const league = await db.query.leagues.findFirst({
      where: and(eq(leagues.id, input.leagueId), eq(leagues.userId, userId)),
      with: { teams: true },
    });

    if (!league) throw new Error('League not found');
    if (!league.externalSource || league.externalSource !== 'ESPN') {
      throw new Error('League is not linked to ESPN');
    }

    // Parse sport from externalId
    const sport = league.externalId?.replace('_playoffs', '') as SportType;
    if (!sport) throw new Error('Could not determine sport');

    const fetchResult = await fetchESPNPlayoffs(sport);
    if (!fetchResult.success) throw new Error(fetchResult.error);

    const leagueTeams = league.teams as Team[];
    let updatedCount = 0;

    for (const game of fetchResult.data) {
      if (game.status !== 'completed') continue;

      // Find matching event by externalId
      const existingEvent = await db.query.events.findFirst({
        where: and(
          eq(events.leagueId, league.id),
          eq(events.externalId, game.externalId),
        ),
      });

      if (!existingEvent || existingEvent.status === 'completed') continue;

      const homeTeamId = existingEvent.homeTeamId;
      const awayTeamId = existingEvent.awayTeamId;
      let winnerId: string | null = null;

      if (game.homeTeam.winner && homeTeamId) winnerId = homeTeamId;
      else if (game.awayTeam.winner && awayTeamId) winnerId = awayTeamId;

      await db
        .update(events)
        .set({
          homeScore: game.homeTeam.score ?? null,
          awayScore: game.awayTeam.score ?? null,
          winnerId,
          status: 'completed',
          updatedAt: new Date(),
        })
        .where(eq(events.id, existingEvent.id));

      // Advance winner
      if (winnerId && existingEvent.roundNumber && existingEvent.matchIndex !== null) {
        const nextRound = existingEvent.roundNumber + 1;
        const nextMatchIndex = Math.floor(existingEvent.matchIndex / 2);
        const isHomeSlot = existingEvent.matchIndex % 2 === 0;

        const nextEvent = await db.query.events.findFirst({
          where: and(
            eq(events.leagueId, league.id),
            eq(events.roundNumber, nextRound),
            eq(events.matchIndex, nextMatchIndex),
          ),
        });

        if (nextEvent) {
          const winnerTeam = leagueTeams.find((t) => t.id === winnerId);
          const updates: Record<string, unknown> = { updatedAt: new Date() };

          if (isHomeSlot) {
            updates.homeTeamId = winnerId;
          } else {
            updates.awayTeamId = winnerId;
          }

          const currentHome = isHomeSlot ? winnerTeam?.name : (nextEvent.homeTeamId ? leagueTeams.find(t => t.id === nextEvent.homeTeamId)?.name : null);
          const currentAway = !isHomeSlot ? winnerTeam?.name : (nextEvent.awayTeamId ? leagueTeams.find(t => t.id === nextEvent.awayTeamId)?.name : null);
          updates.name = `${currentHome ?? 'TBD'} vs ${currentAway ?? 'TBD'}`;

          await db.update(events).set(updates).where(eq(events.id, nextEvent.id));
        }
      }

      updatedCount++;
    }

    // Update lastSyncedAt
    await db
      .update(leagues)
      .set({ lastSyncedAt: new Date(), updatedAt: new Date() })
      .where(eq(leagues.id, league.id));

    revalidatePath('/dashboard');
    return { updatedCount };
  },
);

// ── Simulate Bracket Pick ──────────────────────────────────────────────────

export const simulateBracketPick = createAuthenticatedAction(
  SimulateBracketPickSchema,
  async (input, userId) => {
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, input.eventId), eq(events.userId, userId)),
    });

    if (!event) throw new Error('Event not found');
    if (!event.leagueId) throw new Error('Event is not part of a league');

    const league = await db.query.leagues.findFirst({
      where: eq(leagues.id, event.leagueId),
    });

    if (!league) throw new Error('League not found');

    const currentPredictions = (league.predictions ?? {}) as Record<string, string>;
    currentPredictions[input.eventId] = input.predictedWinnerId;

    await db
      .update(leagues)
      .set({ predictions: currentPredictions, updatedAt: new Date() })
      .where(eq(leagues.id, league.id));

    revalidatePath('/dashboard');
    return currentPredictions;
  },
);
