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

export const useInsights = () => useStore(s => computeInsights(s.journal));

export const useUnlocked = () => {
  const life = useLifetimeDays();
  return unlockedCompanions(life);
};
