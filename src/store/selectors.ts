import {useMemo} from 'react';
import {useStore} from './index';
import {currentStreakDays, lifetimeDays, progressDays} from '@/lib/streak';
import {rankForDays, unlockedCompanions} from '@/lib/ranks';
import {moneySaved, unitsAvoided, packsNotBought, HABITS} from '@/lib/savings';
import {restoresLeft, FREE_RESTORES_PER_MONTH} from '@/lib/restores';
import {checkInStreak, computeInsights} from '@/lib/journal';

/*
 * Every date-dependent selector reads the store's `today` rather than the wall
 * clock. A selector only re-runs when the store changes, so one that read the
 * clock directly would freeze on the day it last rendered — the day clock
 * (src/lib/clock.ts) advances `today` at midnight and on app resume.
 */

/** Current streak in whole days — a logged slip resets it. */
export const useStreakDays = () => useStore(s => currentStreakDays(s.streak, s.today));

/** The day the current streak started (quit date, or the last restart). */
export const useStreakStart = () => useStore(s => s.streak.streakStart);

/** Lifetime clean days — banked + current. Never reduced by a slip. */
export const useLifetimeDays = () => useStore(s => lifetimeDays(s.streak, s.today));

/** Days that count for rank and unlocks (lifetime, never lower than reached). */
const useProgressDays = () => useStore(s => progressDays(s.streak, s.today));

export const useRank = () => {
  const days = useProgressDays();
  return useMemo(() => rankForDays(days), [days]);
};

export const useUnlocked = () => {
  const days = useProgressDays();
  return useMemo(() => unlockedCompanions(days), [days]);
};

/** Real money saved and units avoided, from the user's onboarding inputs. */
export const useSavings = () => {
  const habit = useStore(s => s.habit);
  const life = useLifetimeDays();
  return useMemo(
    () => ({
      saved: moneySaved(habit, life),
      avoided: unitsAvoided(habit, life),
      packs: packsNotBought(habit, life),
      habit,
      spec: HABITS[habit.type],
    }),
    [habit, life],
  );
};

/**
 * Insights are DERIVED, so they must not be computed inside the store selector:
 * a fresh object every snapshot makes useSyncExternalStore re-render forever.
 * Subscribe to the raw journal and memoise the derivation.
 */
export const useInsights = () => {
  const journal = useStore(s => s.journal);
  return useMemo(() => computeInsights(journal), [journal]);
};

/** Today's journal entry, if the user has already checked in today. */
export const useTodayEntry = () =>
  useStore(s => s.journal.find(e => e.day === s.today) ?? null);

/** Consecutive days with a check-in (the journal-log streak). */
export const useCheckInStreak = () => useStore(s => checkInStreak(s.journal, s.today));

/** Free restores left in the current calendar month. */
export const useRestoresLeft = () => useStore(s => restoresLeft(s.ledger, s.today));
export {FREE_RESTORES_PER_MONTH};

/**
 * True once today's "still clean" hold is done. `>=` rather than `===`: after
 * flying west the local date can fall back behind the day already held, and
 * that day must not re-open.
 */
export const useHeldToday = () =>
  useStore(s => s.lastHeldAt !== null && s.lastHeldAt >= s.today);
