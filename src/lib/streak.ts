import dayjs from 'dayjs';

export type StreakState = {
  /** ISO timestamp the current streak started (quit moment or last reset) */
  streakStart: string;
  /** clean days banked from previous streaks (does not reset on a slip) */
  bankedDays: number;
  /** restores left to rescue a streak after a slip */
  restoresLeft: number;
};

export const FREE_RESTORES = 2;

/** Whole days elapsed in the current streak. */
export function currentStreakDays(s: StreakState, now = dayjs()): number {
  return Math.max(0, now.startOf('day').diff(dayjs(s.streakStart).startOf('day'), 'day'));
}

/** Lifetime clean days = banked + current streak. Drives rank & savings. */
export function lifetimeDays(s: StreakState, now = dayjs()): number {
  return s.bankedDays + currentStreakDays(s, now);
}

/** Begin a fresh quit (onboarding, or starting over at day 1). */
export function startStreak(now = dayjs()): Pick<StreakState, 'streakStart'> {
  return {streakStart: now.toISOString()};
}

/**
 * A slip where the user restores: keep the current streak, spend one restore.
 * No change to banked days or streak start.
 */
export function restoreSlip(s: StreakState): StreakState {
  if (s.restoresLeft <= 0) return s;
  return {...s, restoresLeft: s.restoresLeft - 1};
}

/**
 * A slip where the user starts over: bank the clean days earned so far (rank
 * and savings are preserved), then reset the streak to day 1.
 */
export function resetSlip(s: StreakState, now = dayjs()): StreakState {
  const banked = s.bankedDays + currentStreakDays(s, now);
  return {...s, bankedDays: banked, streakStart: now.toISOString()};
}
