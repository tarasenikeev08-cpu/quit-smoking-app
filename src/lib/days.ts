import dayjs from 'dayjs';

/**
 * Calendar days, as the user lives them.
 *
 * Every date the app stores is a local calendar-day key, "YYYY-MM-DD" — never a
 * timestamp. A streak is about days on the user's calendar, so:
 *   - flying to another timezone doesn't shift a stored day, and
 *   - day arithmetic is done on the calendar itself (via UTC midnights), so a
 *     23- or 25-hour daylight-saving day still counts as exactly one day.
 * Only "what day is it now" depends on the device clock and timezone.
 */
export type DayKey = string;

const DAY_KEY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The local calendar day of a moment (default: now). */
export function dayKey(d: Date | dayjs.Dayjs = new Date()): DayKey {
  return dayjs(d).format('YYYY-MM-DD');
}

export const todayKey = (): DayKey => dayKey();

/** A well-formed key for a real calendar date (rejects 2026-02-30). */
export function isDayKey(v: unknown): v is DayKey {
  if (typeof v !== 'string') return false;
  const m = DAY_KEY.exec(v);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

function utcMidnight(key: DayKey): number {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms: number): DayKey {
  const t = new Date(ms);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${t.getUTCFullYear()}-${p(t.getUTCMonth() + 1)}-${p(t.getUTCDate())}`;
}

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). */
export function dayDiff(from: DayKey, to: DayKey): number {
  return Math.round((utcMidnight(to) - utcMidnight(from)) / 86_400_000);
}

export function addDays(key: DayKey, n: number): DayKey {
  return fromUtc(utcMidnight(key) + n * 86_400_000);
}

/** "YYYY-MM" — the month a day belongs to (free restores reset on this). */
export const monthOf = (key: DayKey): string => key.slice(0, 7);

/** Later of two keys (keys sort lexically in date order). */
export const maxDay = (a: DayKey, b: DayKey): DayKey => (a >= b ? a : b);

/** "3 Nov", or "3 Nov 2025" when not in the current year. */
export function formatDay(key: DayKey, today: DayKey = todayKey()): string {
  const d = dayjs(key);
  return key.slice(0, 4) === today.slice(0, 4) ? d.format('D MMM') : d.format('D MMM YYYY');
}

/** "Today", "Yesterday", "5 days ago". */
export function relativeDay(key: DayKey, today: DayKey = todayKey()): string {
  const n = dayDiff(key, today);
  if (n <= 0) return 'Today';
  if (n === 1) return 'Yesterday';
  return `${n} days ago`;
}
