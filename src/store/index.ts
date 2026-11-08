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
import {JournalEntry, Trigger, TRIGGERS} from '@/lib/journal';
import {RANKS} from '@/lib/ranks';

/** Calendar-day key used for "held today" and the day clock. */
export const DAY_FORMAT = 'YYYY-MM-DD';
export const todayKey = () => dayjs().format(DAY_FORMAT);

export type AppState = {
  hydrated: boolean;
  onboarded: boolean;

  /**
   * The current calendar day. NOT persisted. Selectors derive the streak and
   * "held today" from this rather than calling dayjs() themselves, so they
   * recompute when the day clock (src/lib/clock.ts) advances it — at midnight,
   * and whenever the app comes back to the foreground.
   */
  today: string;

  habit: Habit;
  streak: StreakState;
  journal: JournalEntry[];
  equipped: CompanionId;

  isPremium: boolean;
  /** day key (YYYY-MM-DD) of the last completed "still clean" hold */
  lastHeldAt: string | null;

  // actions
  /** advance `today` if the calendar day has changed; cheap no-op otherwise */
  syncToday: () => void;
  setHabit: (monthlySpend: number) => void;
  finishOnboarding: () => void;
  logEntry: (e: {craving: number; triggers: Trigger[]; mood: number}) => void;
  spendRestore: () => void;
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

/* ------------------------- persisted-state validation ------------------------- */

const COMPANION_IDS = new Set<string>(RANKS.map(r => r.companion));
const TRIGGER_SET = new Set<string>(TRIGGERS);
const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const nonNeg = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback;

const validDate = (v: unknown): v is string =>
  typeof v === 'string' && dayjs(v).isValid();

function cleanEntry(v: unknown): JournalEntry | null {
  if (!isObj(v) || typeof v.id !== 'string' || !validDate(v.createdAt)) return null;
  const clamp = (n: unknown) => Math.min(5, Math.max(1, Math.round(nonNeg(n, 3))));
  return {
    id: v.id,
    createdAt: v.createdAt,
    craving: clamp(v.craving),
    mood: clamp(v.mood),
    triggers: Array.isArray(v.triggers)
      ? (v.triggers.filter(t => typeof t === 'string' && TRIGGER_SET.has(t)) as Trigger[])
      : [],
  };
}

/**
 * Merge persisted state over the defaults, field by field.
 *
 * zustand's default merge is shallow, so a persisted `habit` missing a field
 * (an older build, or a hand-edited store) would REPLACE the default habit and
 * leave e.g. cigsPerDay undefined — which renders as "NaN" on Home. Every field
 * is validated and falls back to its default individually instead.
 */
function mergePersisted(persisted: unknown, current: AppState): AppState {
  if (!isObj(persisted)) return current;
  const p = persisted;
  const h = isObj(p.habit) ? p.habit : {};
  const s = isObj(p.streak) ? p.streak : {};

  const monthlySpend = nonNeg(h.monthlySpend, current.habit.monthlySpend);
  const habit: Habit = {
    monthlySpend,
    cigsPerDay: nonNeg(h.cigsPerDay, inferCigsPerDay(monthlySpend)),
    currencySymbol:
      typeof h.currencySymbol === 'string' && h.currencySymbol
        ? h.currencySymbol
        : current.habit.currencySymbol,
  };

  const streak: StreakState = {
    streakStart: validDate(s.streakStart) ? s.streakStart : current.streak.streakStart,
    bankedDays: Math.floor(nonNeg(s.bankedDays, 0)),
    restoresLeft: Math.floor(nonNeg(s.restoresLeft, FREE_RESTORES)),
  };

  return {
    ...current,
    onboarded: p.onboarded === true,
    isPremium: p.isPremium === true,
    habit,
    streak,
    journal: Array.isArray(p.journal)
      ? p.journal.map(cleanEntry).filter((e): e is JournalEntry => e !== null)
      : [],
    equipped:
      typeof p.equipped === 'string' && COMPANION_IDS.has(p.equipped)
        ? (p.equipped as CompanionId)
        : current.equipped,
    lastHeldAt:
      typeof p.lastHeldAt === 'string' && DAY_KEY.test(p.lastHeldAt) ? p.lastHeldAt : null,
  };
}

/* ----------------------------------- store ----------------------------------- */

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      today: todayKey(),
      habit: DEFAULT_HABIT,
      streak: freshStreak(),
      journal: [],
      equipped: 'puff',
      isPremium: false,
      lastHeldAt: null,

      syncToday: () => {
        const d = todayKey();
        if (get().today !== d) set({today: d});
      },

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
      finishOnboarding: () =>
        set({onboarded: true, streak: freshStreak(), today: todayKey(), lastHeldAt: null}),

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

      spendRestore: () => set(state => ({streak: restoreSlip(state.streak)})),

      // Starting over means today was NOT clean, so any "still clean" hold
      // already banked today no longer stands — the companion goes back to sleep.
      startOver: () =>
        set(state => {
          const d = todayKey();
          return {
            streak: resetSlip(state.streak),
            today: d,
            lastHeldAt: state.lastHeldAt === d ? null : state.lastHeldAt,
          };
        }),

      equip: id => set({equipped: id}),

      // Writes `today` too: if the clock hadn't ticked yet (e.g. a hold right
      // after midnight), "held today" must still match the day just banked.
      markHeld: () => {
        const d = todayKey();
        set({lastHeldAt: d, today: d});
      },

      setPremium: v => set({isPremium: v}),

      resetAll: () =>
        set({
          onboarded: false,
          today: todayKey(),
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
      // Runtime-only fields are never written to storage.
      partialize: ({hydrated: _h, today: _t, ...rest}) => rest,
      merge: (persisted, current) => mergePersisted(persisted, current),
      // Fires on success AND on a storage error — either way, stop the splash.
      onRehydrateStorage: () => () => {
        useStore.setState({hydrated: true, today: todayKey()});
      },
    },
  ),
);
