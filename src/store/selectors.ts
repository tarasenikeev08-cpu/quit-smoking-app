import {useMemo} from 'react';
import dayjs from 'dayjs';
import {useStore} from './index';
import {currentStreakDays, lifetimeDays} from '@/lib/streak';
import {rankForDays, unlockedCompanions} from '@/lib/ranks';
import {moneySaved, cigarettesAvoided, packsNotBought} from '@/lib/savings';
import {computeInsights} from '@/lib/journal';

/*
 * Every date-dependent selector reads the store's `today` rather than calling
 * dayjs() on its own. A selector only re-runs when the store changes, so one
 * that read the wall clock directly would freeze at whatever day it last
 * rendered — the bug the day clock (src/lib/clock.ts) exists to prevent.
 */

/** Current streak length in whole days. */
export const useStreakDays = () =>
  useStore(s => currentStreakDays(s.streak, dayjs(s.today)));

/** Lifetime clean days (drives rank + savings). */
export const useLifetimeDays = () =>
  useStore(s => lifetimeDays(s.streak, dayjs(s.today)));

export const useRank = () => {
  const life = useLifetimeDays();
  return useMemo(() => rankForDays(life), [life]);
};

export const useSavings = () => {
  const habit = useStore(s => s.habit);
  const life = useLifetimeDays();
  return useMemo(
    () => ({
      saved: moneySaved(habit, life),
      avoided: cigarettesAvoided(habit, life),
      packs: packsNotBought(habit, life),
      habit,
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

export const useUnlocked = () => {
  const life = useLifetimeDays();
  return useMemo(() => unlockedCompanions(life), [life]);
};

/** True when the "still clean" hold has already been completed today. */
export const useHeldToday = () => useStore(s => s.lastHeldAt === s.today);
