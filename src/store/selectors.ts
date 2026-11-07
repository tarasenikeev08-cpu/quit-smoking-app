import {useMemo} from 'react';
import dayjs from 'dayjs';
import {useStore} from './index';
import {currentStreakDays, lifetimeDays} from '@/lib/streak';
import {rankForDays, unlockedCompanions} from '@/lib/ranks';
import {moneySaved, cigarettesAvoided, packsNotBought} from '@/lib/savings';
import {computeInsights} from '@/lib/journal';

/** Current streak length in whole days. */
export const useStreakDays = () => useStore(s => currentStreakDays(s.streak));

/** Lifetime clean days (drives rank + savings). */
export const useLifetimeDays = () => useStore(s => lifetimeDays(s.streak));

export const useRank = () => {
  const life = useLifetimeDays();
  return rankForDays(life);
};

export const useSavings = () => {
  const habit = useStore(s => s.habit);
  const life = useLifetimeDays();
  return {
    saved: moneySaved(habit, life),
    avoided: cigarettesAvoided(habit, life),
    packs: packsNotBought(habit, life),
    habit,
  };
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
export const useHeldToday = () =>
  useStore(s => s.lastHeldAt === dayjs().format('YYYY-MM-DD'));
