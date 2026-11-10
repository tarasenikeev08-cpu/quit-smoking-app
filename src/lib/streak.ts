import {DayKey, dayDiff} from './days';

/**
 * Streak state. Two numbers are kept deliberately separate:
 *
 *   current streak  — consecutive clean days since `streakStart`. A logged slip
 *                     (start over) resets it.
 *   lifetime days   — `bankedDays + current streak`. Drives rank, savings and
 *                     companions, and a slip NEVER reduces it: starting over
 *                     banks the streak first.
 *
 * Clean days are calendar days. A day you don't open the app — a missed hold —
 * still counts: you didn't smoke, you just didn't check in. Only a logged slip
 * breaks the streak.
 */
export type StreakState = {
  /** day key the current streak started (the quit date, or the last restart) */
  streakStart: DayKey;
  /** clean days banked from earlier streaks — survives every slip */
  bankedDays: number;
  /**
   * Highest lifetime ever observed. Rank and unlocked companions are derived
   * from this, so they can't be taken away if the device clock or timezone
   * briefly moves the calendar backwards.
   */
  bestLifetime: number;
};

export const newStreak = (start: DayKey): StreakState => ({
  streakStart: start,
  bankedDays: 0,
  bestLifetime: 0,
});

/** Whole clean days in the current streak (0 on the day it starts). */
export function currentStreakDays(s: StreakState, today: DayKey): number {
  return Math.max(0, dayDiff(s.streakStart, today));
}

/** Lifetime clean days — banked plus current. Drives savings. */
export function lifetimeDays(s: StreakState, today: DayKey): number {
  return s.bankedDays + currentStreakDays(s, today);
}

/** Days that count for rank and unlocks: never lower than ever reached. */
export function progressDays(s: StreakState, today: DayKey): number {
  return Math.max(lifetimeDays(s, today), s.bestLifetime);
}

/** Record today's lifetime as the high-water mark if it's a new best. */
export function recordProgress(s: StreakState, today: DayKey): StreakState {
  const life = lifetimeDays(s, today);
  return life > s.bestLifetime ? {...s, bestLifetime: life} : s;
}

/**
 * A logged slip where the user starts over: bank the clean days earned so far
 * (lifetime, rank and savings are untouched), then restart the streak today.
 */
export function startOver(s: StreakState, today: DayKey): StreakState {
  const recorded = recordProgress(s, today);
  return {
    streakStart: today,
    bankedDays: recorded.bankedDays + currentStreakDays(recorded, today),
    bestLifetime: recorded.bestLifetime,
  };
}
