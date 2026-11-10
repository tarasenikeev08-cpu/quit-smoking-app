import dayjs from 'dayjs';
import {DayKey, addDays} from './days';

export const TRIGGERS = [
  'Stress',
  'Coffee',
  'Alcohol',
  'Social',
  'After meal',
  'Boredom',
] as const;
export type Trigger = (typeof TRIGGERS)[number];

export type JournalEntry = {
  id: string;
  /**
   * The local calendar day this check-in is for. One entry per day: checking
   * in again the same day updates it. Stored as a day key, so travelling
   * across timezones never moves an entry to a different day.
   */
  day: DayKey;
  /** ISO timestamp of the (latest) check-in — only used for time-of-day insights */
  createdAt: string;
  /** craving strength 1..5 */
  craving: number;
  triggers: Trigger[];
  /** mood 1..5 */
  mood: number;
};

export type Insights = {
  entryCount: number;
  /**
   * How much stronger cravings are on entries tagged Alcohol vs. untagged ones.
   * Only reported when it's a real effect (>= 1.2x); null otherwise, so the UI
   * never claims "0.6x harder" or "1x harder".
   */
  alcoholMultiplier: number | null;
  /** average craving per 4-hour bucket starting 6am: [6-10,10-14,14-18,18-22,22-2,2-6] */
  cravingByBucket: number[];
  bucketLabels: string[];
  /** index of the peak craving bucket, or -1 when no data */
  peakBucket: number;
  /** human name for the peak bucket, plural ("Afternoons"), or null */
  peakLabel: string | null;
};

/** Short axis labels, one per 4h bucket, at each bucket's midpoint. */
const BUCKET_LABELS = ['8am', 'noon', '4pm', '8pm', 'mid', '4am'];

/** Readable names for the same buckets, used in sentences. */
const BUCKET_NAMES = [
  'Mornings',
  'Middays',
  'Afternoons',
  'Evenings',
  'Late nights',
  'Small hours',
];

/** Smallest multiplier worth telling the user about. */
const MIN_MULTIPLIER = 1.2;

function bucketOf(iso: string): number {
  const h = dayjs(iso).hour();
  // buckets of 4h, starting at 6am
  return Math.floor(((h - 6 + 24) % 24) / 4);
}

export function computeInsights(entries: JournalEntry[]): Insights {
  const base: Insights = {
    entryCount: entries.length,
    alcoholMultiplier: null,
    cravingByBucket: [0, 0, 0, 0, 0, 0],
    bucketLabels: BUCKET_LABELS,
    peakBucket: -1,
    peakLabel: null,
  };
  if (entries.length === 0) return base;

  // craving by time-of-day bucket
  const sums = [0, 0, 0, 0, 0, 0];
  const counts = [0, 0, 0, 0, 0, 0];
  for (const e of entries) {
    const b = bucketOf(e.createdAt);
    sums[b] += e.craving;
    counts[b] += 1;
  }
  const avg = sums.map((s, i) => (counts[i] ? s / counts[i] : 0));
  let peak = -1;
  let peakVal = -1;
  avg.forEach((v, i) => {
    if (counts[i] && v > peakVal) {
      peakVal = v;
      peak = i;
    }
  });

  // alcohol multiplier
  const withAlc = entries.filter(e => e.triggers.includes('Alcohol'));
  const withoutAlc = entries.filter(e => !e.triggers.includes('Alcohol'));
  let mult: number | null = null;
  if (withAlc.length >= 1 && withoutAlc.length >= 1) {
    const a = withAlc.reduce((s, e) => s + e.craving, 0) / withAlc.length;
    const b = withoutAlc.reduce((s, e) => s + e.craving, 0) / withoutAlc.length;
    if (b > 0) {
      const ratio = Math.round((a / b) * 10) / 10;
      if (ratio >= MIN_MULTIPLIER) mult = ratio;
    }
  }

  return {
    ...base,
    cravingByBucket: avg,
    peakBucket: peak,
    peakLabel: peak >= 0 ? BUCKET_NAMES[peak] : null,
    alcoholMultiplier: mult,
  };
}

/**
 * The journal-log streak: consecutive days with a check-in, ending today — or
 * yesterday, if today's check-in hasn't happened yet (the streak isn't broken
 * until a whole day is missed).
 */
export function checkInStreak(entries: JournalEntry[], today: DayKey): number {
  const days = new Set(entries.map(e => e.day));
  let cursor = days.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (days.has(cursor)) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}
