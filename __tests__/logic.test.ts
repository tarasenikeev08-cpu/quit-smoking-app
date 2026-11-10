/**
 * Pure date / streak / ledger / savings logic. Runs under several timezones
 * via `npm run test:tz` — none of these results may depend on the TZ.
 */
import {addDays, dayDiff, dayKey, isDayKey, monthOf} from '../src/lib/days';
import {
  currentStreakDays,
  lifetimeDays,
  newStreak,
  progressDays,
  recordProgress,
  startOver,
} from '../src/lib/streak';
import {appendEvent, restoresLeft, LedgerEvent} from '../src/lib/restores';
import {
  defaultHabit,
  dailySpend,
  moneySaved,
  unitsAvoided,
  packsNotBought,
  clampHabit,
} from '../src/lib/savings';
import {checkInStreak, JournalEntry} from '../src/lib/journal';

describe('calendar days', () => {
  test('a late-night local moment belongs to that local day, in any timezone', () => {
    expect(dayKey(new Date(2026, 10, 10, 23, 59, 59))).toBe('2026-11-10');
    expect(dayKey(new Date(2026, 10, 11, 0, 0, 1))).toBe('2026-11-11');
  });

  test('day arithmetic is calendar arithmetic (DST-safe)', () => {
    // US DST ended 1 Nov 2026, EU on 25 Oct: still exactly one day per day
    expect(dayDiff('2026-10-31', '2026-11-02')).toBe(2);
    expect(dayDiff('2026-10-24', '2026-10-26')).toBe(2);
    expect(dayDiff('2026-03-07', '2026-03-09')).toBe(2);
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29');
    expect(dayDiff('2026-11-10', '2026-11-03')).toBe(-7);
  });

  test('rejects malformed and impossible dates', () => {
    expect(isDayKey('2026-02-30')).toBe(false);
    expect(isDayKey('2026-11-10T00:00:00Z')).toBe(false);
    expect(isDayKey('2028-02-29')).toBe(true);
    expect(monthOf('2026-11-10')).toBe('2026-11');
  });
});

describe('streak vs lifetime', () => {
  test('quit day is day 0; each calendar day adds one', () => {
    const s = newStreak('2026-11-01');
    expect(currentStreakDays(s, '2026-11-01')).toBe(0);
    expect(currentStreakDays(s, '2026-11-10')).toBe(9);
  });

  test('a missed day (no hold, no app open) does not break the streak', () => {
    const s = newStreak('2026-11-01');
    // nothing happened on the 5th; the count simply carries on
    expect(currentStreakDays(s, '2026-11-06')).toBe(5);
  });

  test('a logged slip resets the streak but never lowers lifetime or rank', () => {
    let s = newStreak('2026-10-01');
    const before = lifetimeDays(s, '2026-11-10'); // 40
    s = startOver(s, '2026-11-10');
    expect(currentStreakDays(s, '2026-11-10')).toBe(0);
    expect(lifetimeDays(s, '2026-11-10')).toBe(before);
    expect(progressDays(s, '2026-11-10')).toBe(before);
    // and lifetime keeps growing from there
    expect(lifetimeDays(s, '2026-11-15')).toBe(before + 5);
  });

  test('two slips on the same day bank nothing extra', () => {
    let s = startOver(newStreak('2026-11-01'), '2026-11-10');
    s = startOver(s, '2026-11-10');
    expect(lifetimeDays(s, '2026-11-10')).toBe(9);
  });

  test('rank progress never goes backwards if the clock does', () => {
    let s = recordProgress(newStreak('2026-11-01'), '2026-11-20'); // best 19
    // device clock / timezone moves the calendar back a day
    expect(lifetimeDays(s, '2026-11-19')).toBe(18);
    expect(progressDays(s, '2026-11-19')).toBe(19);
    s = recordProgress(s, '2026-11-19');
    expect(s.bestLifetime).toBe(19);
  });

  test('a streak start in the future counts as zero, not negative', () => {
    expect(currentStreakDays(newStreak('2026-11-12'), '2026-11-10')).toBe(0);
  });
});

describe('restore ledger', () => {
  const restore = (day: string): LedgerEvent => ({day, kind: 'restore', streakDays: 3});

  test('free restores reset when the calendar month changes', () => {
    let l: LedgerEvent[] = [];
    l = appendEvent(l, restore('2026-11-29'));
    l = appendEvent(l, restore('2026-11-30'));
    expect(restoresLeft(l, '2026-11-30')).toBe(0);
    expect(restoresLeft(l, '2026-12-01')).toBe(2);
    // and across a year boundary
    expect(restoresLeft([restore('2026-12-31'), restore('2026-12-31')], '2027-01-01')).toBe(2);
  });

  test('a reset (start over) does not use a free restore', () => {
    const l: LedgerEvent[] = [{day: '2026-11-10', kind: 'reset', streakDays: 9}];
    expect(restoresLeft(l, '2026-11-10')).toBe(2);
  });
});

describe('savings from onboarding inputs', () => {
  test('money saved = amount/day ÷ pack size × pack price × clean days', () => {
    const h = {...defaultHabit('cigarettes'), amountPerDay: 20, unitsPerPack: 20, pricePerPack: 15};
    expect(dailySpend(h)).toBe(15);
    expect(moneySaved(h, 5)).toBe(75);
    expect(unitsAvoided(h, 5)).toBe(100);
    expect(packsNotBought(h, 5)).toBe(5);
  });

  test('vape: half a pod a day, $16 for 4 pods', () => {
    const h = {...defaultHabit('vape'), amountPerDay: 0.5};
    expect(dailySpend(h)).toBe(2);
    expect(moneySaved(h, 30)).toBe(60);
  });

  test('inputs are clamped to sane ranges', () => {
    const h = clampHabit({...defaultHabit('cigarettes'), amountPerDay: 999, pricePerPack: -3});
    expect(h.amountPerDay).toBe(80);
    expect(h.pricePerPack).toBe(0.5);
  });
});

describe('journal-log streak', () => {
  const e = (day: string): JournalEntry => ({
    id: day,
    day,
    createdAt: `${day}T12:00:00.000Z`,
    craving: 3,
    mood: 3,
    triggers: [],
  });

  test('counts consecutive days ending today', () => {
    expect(checkInStreak([e('2026-11-10'), e('2026-11-09'), e('2026-11-08')], '2026-11-10')).toBe(3);
  });

  test("isn't broken yet if today's check-in hasn't happened", () => {
    expect(checkInStreak([e('2026-11-09'), e('2026-11-08')], '2026-11-10')).toBe(2);
  });

  test('a missed day breaks it', () => {
    expect(checkInStreak([e('2026-11-10'), e('2026-11-08')], '2026-11-10')).toBe(1);
    expect(checkInStreak([e('2026-11-07')], '2026-11-10')).toBe(0);
  });
});
