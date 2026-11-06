import {CompanionId} from '@/components/Companion';

export type Rank = {
  key: string;
  name: string;
  /** lifetime clean days required to reach this rank */
  threshold: number;
  /** companion unlocked on reaching this rank */
  companion: CompanionId;
};

/**
 * The rank ladder. Rank is earned on LIFETIME clean days, so a slip breaks your
 * streak but never your rank, savings, or unlocked companions.
 *
 * Thresholds match design/reference.html (Steel 14d, Silver 30d, Graphite 60d).
 * One companion unlocks per tier.
 */
export const RANKS: Rank[] = [
  {key: 'ash', name: 'Ash', threshold: 0, companion: 'puff'},
  {key: 'ember', name: 'Ember', threshold: 3, companion: 'sprout'},
  {key: 'iron', name: 'Iron', threshold: 7, companion: 'mecha'},
  {key: 'steel', name: 'Steel', threshold: 14, companion: 'pebble'},
  {key: 'silver', name: 'Silver', threshold: 30, companion: 'luna'},
  {key: 'graphite', name: 'Graphite', threshold: 60, companion: 'slime'},
  {key: 'obsidian', name: 'Obsidian', threshold: 90, companion: 'kit'},
  {key: 'titanium', name: 'Titanium', threshold: 180, companion: 'dragon'},
  {key: 'diamond', name: 'Diamond', threshold: 365, companion: 'phoenix'},
];

export type RankProgress = {
  current: Rank;
  next: Rank | null;
  /** 0..1 progress from current threshold to next */
  progress: number;
  /** whole days remaining to next rank, or 0 at max */
  daysToNext: number;
};

export function rankForDays(lifetimeDays: number): RankProgress {
  let currentIndex = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (lifetimeDays >= RANKS[i].threshold) {
      currentIndex = i;
    }
  }
  const current = RANKS[currentIndex];
  const next = RANKS[currentIndex + 1] ?? null;

  if (!next) {
    return {current, next: null, progress: 1, daysToNext: 0};
  }
  const span = next.threshold - current.threshold;
  const into = lifetimeDays - current.threshold;
  return {
    current,
    next,
    progress: Math.max(0, Math.min(1, into / span)),
    daysToNext: Math.max(0, next.threshold - lifetimeDays),
  };
}

/** Companions unlocked given lifetime days (one per rank reached). */
export function unlockedCompanions(lifetimeDays: number): CompanionId[] {
  return RANKS.filter(r => lifetimeDays >= r.threshold).map(r => r.companion);
}
