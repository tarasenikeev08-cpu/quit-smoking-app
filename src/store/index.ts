import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

import {CompanionId} from '@/components/Companion';
import {
  StreakState,
  FREE_RESTORES,
  startStreak,
  restoreSlip,
  resetSlip,
} from '@/lib/streak';
import {Habit, DEFAULT_HABIT, inferCigsPerDay} from '@/lib/savings';
import {JournalEntry, Trigger} from '@/lib/journal';

export type AppState = {
  hydrated: boolean;
  onboarded: boolean;

  habit: Habit;
  streak: StreakState;
  journal: JournalEntry[];
  equipped: CompanionId;

  isPremium: boolean;
  /** ISO date (YYYY-MM-DD) of the last completed "still clean" hold */
  lastHeldAt: string | null;

  // actions
  setHabit: (monthlySpend: number) => void;
  finishOnboarding: () => void;
  logEntry: (e: {craving: number; triggers: Trigger[]; mood: number}) => void;
  useRestore: () => void;
  startOver: () => void;
  equip: (id: CompanionId) => void;
  /** record a completed hold for today */
  markHeld: () => void;
  setPremium: (v: boolean) => void;
  resetAll: () => void;
};

const freshStreak = (): StreakState => ({
  ...startStreak(),
  bankedDays: 0,
  restoresLeft: FREE_RESTORES,
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      habit: DEFAULT_HABIT,
      streak: freshStreak(),
      journal: [],
      equipped: 'puff',
      isPremium: false,
      lastHeldAt: null,

      // Capture the habit during onboarding (does not finish onboarding).
      setHabit: monthlySpend =>
        set({
          habit: {
            ...DEFAULT_HABIT,
            monthlySpend,
            cigsPerDay: inferCigsPerDay(monthlySpend),
          },
        }),

      // Final onboarding step: start the clock and enter the app.
      finishOnboarding: () => set({onboarded: true, streak: freshStreak()}),

      logEntry: e =>
        set(state => ({
          journal: [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdAt: dayjs().toISOString(),
              craving: e.craving,
              triggers: e.triggers,
              mood: e.mood,
            },
            ...state.journal,
          ],
        })),

      useRestore: () => set(state => ({streak: restoreSlip(state.streak)})),

      startOver: () => set(state => ({streak: resetSlip(state.streak)})),

      equip: id => set({equipped: id}),

      markHeld: () => set({lastHeldAt: dayjs().format('YYYY-MM-DD')}),

      setPremium: v => set({isPremium: v}),

      resetAll: () =>
        set({
          onboarded: false,
          habit: DEFAULT_HABIT,
          streak: freshStreak(),
          journal: [],
          equipped: 'puff',
          isPremium: false,
          lastHeldAt: null,
        }),
    }),
    {
      name: 'ember-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({hydrated, ...rest}) => rest,
      onRehydrateStorage: () => state => {
        useStore.setState({hydrated: true});
        void state;
      },
    },
  ),
);
