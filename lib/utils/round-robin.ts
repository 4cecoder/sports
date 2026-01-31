/**
 * Generate round-robin pairings using the circle method.
 * Returns rounds of [home, away] pairs.
 * If odd number of teams, one team gets a bye each round (omitted from pairs).
 */
export function generateRoundRobinPairings(
  teamIds: string[]
): [string, string][][] {
  const ids = [...teamIds];
  // If odd number, add a dummy "bye" entry
  const hasBye = ids.length % 2 !== 0;
  if (hasBye) ids.push('__bye__');

  const n = ids.length;
  const rounds: [string, string][][] = [];
  const fixed = ids[0];
  const rotating = ids.slice(1);

  for (let round = 0; round < n - 1; round++) {
    const pairs: [string, string][] = [];
    const current = [fixed, ...rotating];

    for (let i = 0; i < n / 2; i++) {
      const home = current[i];
      const away = current[n - 1 - i];
      if (home === '__bye__' || away === '__bye__') continue;
      pairs.push([home, away]);
    }

    rounds.push(pairs);
    // Rotate: move last element to first position of the rotating array
    rotating.unshift(rotating.pop()!);
  }

  return rounds;
}

/**
 * Generate single-elimination bracket.
 * Returns rounds of [home, away] pairs (first round fully populated,
 * subsequent rounds have placeholder nulls).
 */
export function generateSingleEliminationBracket(
  teamIds: string[]
): [string, string][][] {
  // Pad to next power of 2
  const n = teamIds.length;
  const size = Math.pow(2, Math.ceil(Math.log2(n)));
  const padded = [...teamIds];
  while (padded.length < size) padded.push('__bye__');

  const rounds: [string, string][][] = [];
  // First round
  const firstRound: [string, string][] = [];
  for (let i = 0; i < size; i += 2) {
    firstRound.push([padded[i], padded[i + 1]]);
  }
  rounds.push(firstRound);

  // Subsequent rounds are empty placeholders
  let matchesInRound = size / 4;
  while (matchesInRound >= 1) {
    const round: [string, string][] = [];
    for (let i = 0; i < matchesInRound; i++) {
      round.push(['__tbd__', '__tbd__']);
    }
    rounds.push(round);
    matchesInRound /= 2;
  }

  return rounds;
}
