import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';

import {CompanionId} from '@/components/Companion';
import {DayKey, addDays, dayKey, isDayKey, maxDay, todayKey} from '@/lib/days';
import {
  StreakState,
  currentStreakDays,
  newStreak,
  progressDays,
  recordProgress,
  startOver as startOverStreak,
} from '@/lib/streak';
import {
  FREE_RESTORES_PER_MONTH,
  LedgerEvent,
  appendEvent,
  restoresLeft,
} from '@/lib/restores';
import {
  DEFAULT_HABIT,
  Habit,
  HABITS,
  HabitType,
  clampHabit,
  defaultHabit,
} from '@/lib/savings';
import {JournalEntry, Trigger, TRIGGERS} from '@/lib/journal';
import {RANKS, unlockedCompanions} from '@/lib/ranks';

export {todayKey};
export const DAY_FORMAT = 'YYYY-MM-DD';

/** Furthest back a quit date can be set (~10 years). */
export const MAX_QUIT_DAYS_AGO = 3650;

/**
 * Persisted schema version. Bump it, and add a step to `migrateState`, whenever
 * the persisted shape changes — never edit a released shape in place.
 *   0  original: ISO streakStart, a lifetime restore counter, monthly spend
 *   1  day keys everywhere, onboarding habit inputs + quit date, slip ledger
 *      with monthly restores, one journal entry per day, rank high-water mark
 */
export const STORE_VERSION = 1;
export const STORE_KEY = 'ember-store-v1';

export type AppState = {
  /** runtime only: true once storage has been read (or found empty) */
  hydrated: boolean;
  /**
   * Runtime only: the current calendar day. Selectors derive everything
   * date-based from this rather than calling the clock themselves, so they
   * recompute when the day clock (src/lib/clock.ts) advances it.
   */
  today: DayKey;
  /**
   * Runtime only: set when onboarding has just finished, so Home plays the
   * hand-off celebration once. Never persisted — a relaunch doesn't replay it.
   */
  celebrateOnboarding: boolean;

  onboarded: boolean;
  /** what the user quit and what it cost — entered in onboarding */
  habit: Habit;
  /** the quit date chosen in onboarding; null until chosen */
  quitDate: DayKey | null;
  streak: StreakState;
  /** every logged slip and how it was handled (restores reset monthly) */
  ledger: LedgerEvent[];
  /** day key of the last completed "still clean" hold */
  lastHeldAt: DayKey | null;
  /** newest first, at most one per day */
  journal: JournalEntry[];
  equipped: CompanionId;
  isPremium: boolean;

  // ---- actions ----
  /** advance `today` (and the rank high-water mark) if the day changed */
  syncToday: () => void;
  /** onboarding: pick what's being quit — resets the inputs to its defaults */
  setHabitType: (type: HabitType) => void;
  /** onboarding: change amount / price / pack size */
  updateHabit: (patch: Partial<Omit<Habit, 'type'>>) => void;
  /** onboarding: choose the quit date (clamped to today and earlier) */
  setQuitDate: (day: DayKey) => void;
  /** last onboarding step: start the streak from the quit date */
  finishOnboarding: () => void;
  /** Home has played the hand-off celebration */
  clearCelebration: () => void;
  /** save today's check-in (replaces an earlier one from today) */
  logEntry: (e: {craving: number; triggers: Trigger[]; mood: number}) => void;
  /** slip, kept: spend one of this month's free restores */
  spendRestore: () => void;
  /** slip, start over: bank the streak into lifetime and restart today */
  startOver: () => void;
  equip: (id: CompanionId) => void;
  /** record today's completed hold */
  markHeld: () => void;
  setPremium: (v: boolean) => void;
  resetAll: () => void;
};

type PersistedState = Omit<
  AppState,
  | 'hydrated'
  | 'today'
  | 'celebrateOnboarding'
  | 'clearCelebration'
  | 'syncToday'
  | 'setHabitType'
  | 'updateHabit'
  | 'setQuitDate'
  | 'finishOnboarding'
  | 'logEntry'
  | 'spendRestore'
  | 'startOver'
  | 'equip'
  | 'markHeld'
  | 'setPremium'
  | 'resetAll'
>;

const freshData = (today: DayKey): PersistedState => ({
  onboarded: false,
  habit: DEFAULT_HABIT,
  quitDate: null,
  streak: newStreak(today),
  ledger: [],
  lastHeldAt: null,
  journal: [],
  equipped: 'puff',
  isPremium: false,
});

/* ------------------------------ validation ------------------------------ */

const COMPANION_IDS = new Set<string>(RANKS.map(r => r.companion));
const TRIGGER_SET = new Set<string>(TRIGGERS);
const HABIT_TYPES = new Set<string>(Object.keys(HABITS));

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const num = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback;

const validIso = (v: unknown): v is string => typeof v === 'string' && dayjs(v).isValid();

const clamp15 = (n: unknown) => Math.min(5, Math.max(1, Math.round(num(n, 3))));

function cleanEntry(v: unknown): JournalEntry | null {
  if (!isObj(v) || typeof v.id !== 'string' || !validIso(v.createdAt)) return null;
  return {
    id: v.id,
    day: isDayKey(v.day) ? v.day : dayKey(new Date(v.createdAt)),
    createdAt: v.createdAt,
    craving: clamp15(v.craving),
    mood: clamp15(v.mood),
    triggers: Array.isArray(v.triggers)
      ? (v.triggers.filter(t => typeof t === 'string' && TRIGGER_SET.has(t)) as Trigger[])
      : [],
  };
}

/** One entry per day — keep the newest if a day somehow has several. */
function onePerDay(entries: JournalEntry[]): JournalEntry[] {
  const byDay = new Map<string, JournalEntry>();
  for (const e of entries) {
    const prev = byDay.get(e.day);
    if (!prev || e.createdAt > prev.createdAt) byDay.set(e.day, e);
  }
  return [...byDay.values()].sort((a, b) => (a.day < b.day ? 1 : -1));
}

function cleanHabit(v: unknown): Habit {
  if (!isObj(v)) return DEFAULT_HABIT;
  const type = (typeof v.type === 'string' && HABIT_TYPES.has(v.type) ? v.type : 'cigarettes') as HabitType;
  const d = defaultHabit(type);
  return clampHabit({
    type,
    amountPerDay: num(v.amountPerDay, d.amountPerDay) || d.amountPerDay,
    pricePerPack: num(v.pricePerPack, d.pricePerPack) || d.pricePerPack,
    unitsPerPack: num(v.unitsPerPack, d.unitsPerPack) || d.unitsPerPack,
    currencySymbol:
      typeof v.currencySymbol === 'string' && v.currencySymbol ? v.currencySymbol : '$',
  });
}

function cleanLedger(v: unknown): LedgerEvent[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter(isObj)
    .filter(e => isDayKey(e.day) && (e.kind === 'restore' || e.kind === 'reset'))
    .map(e => ({
      day: e.day as DayKey,
      kind: e.kind as LedgerEvent['kind'],
      streakDays: Math.floor(num(e.streakDays, 0)),
    }));
}

/**
 * Validate a persisted (already migrated) state, field by field, over fresh
 * defaults. Anything missing or malformed falls back on its own, so a partial
 * or hand-edited store can never render "NaN" or crash a screen.
 */
export function cleanState(p: unknown, today: DayKey): PersistedState {
  const base = freshData(today);
  if (!isObj(p)) return base;

  const s = isObj(p.streak) ? p.streak : {};
  const streakStart = isDayKey(s.streakStart) ? s.streakStart : today;
  const streak: StreakState = {
    // a start in the future (clock was ahead) is pulled back to today
    streakStart: streakStart > today ? today : streakStart,
    bankedDays: Math.floor(num(s.bankedDays, 0)),
    bestLifetime: Math.floor(num(s.bestLifetime, 0)),
  };

  const progress = progressDays(streak, today);
  const unlocked = new Set<string>(unlockedCompanions(progress));
  const equipped =
    typeof p.equipped === 'string' && COMPANION_IDS.has(p.equipped) && unlocked.has(p.equipped)
      ? (p.equipped as CompanionId)
      : base.equipped;

  return {
    onboarded: p.onboarded === true,
    habit: cleanHabit(p.habit),
    quitDate: isDayKey(p.quitDate) ? p.quitDate : null,
    streak,
    ledger: cleanLedger(p.ledger),
    lastHeldAt: isDayKey(p.lastHeldAt) ? p.lastHeldAt : null,
    journal: Array.isArray(p.journal)
      ? onePerDay(p.journal.map(cleanEntry).filter((e): e is JournalEntry => e !== null))
      : [],
    equipped,
    isPremium: p.isPremium === true,
  };
}

/* ------------------------------- migration ------------------------------- */

/**
 * Upgrade a persisted state from `version` to STORE_VERSION, one step at a
 * time. Pure — exported for tests.
 */
export function migrateState(persisted: unknown, version: number, today: DayKey): unknown {
  let p: Record<string, unknown> = isObj(persisted) ? {...persisted} : {};

  if (version < 1) {
    // v0 -> v1
    const h = isObj(p.habit) ? p.habit : {};
    const cigs = num(h.cigsPerDay, 0) || 14;
    const monthly = num(h.monthlySpend, 0) || 120;
    // v0 only knew a monthly spend (over 30-day months). Express it as a
    // pack price so the user's savings come out exactly as before.
    const pricePerPack = Math.round(((monthly / 30) / (cigs / 20)) * 100) / 100;

    const s = isObj(p.streak) ? p.streak : {};
    const streakStart = validIso(s.streakStart) ? dayKey(new Date(s.streakStart)) : today;
    const bankedDays = Math.floor(num(s.bankedDays, 0));

    // v0 counted restores over the whole lifetime (2 total); v1 resets them
    // monthly. Carry this month's usage over as ledger entries dated today.
    const usedV0 = Math.max(0, 2 - Math.floor(num(s.restoresLeft, 2)));
    const ledger: LedgerEvent[] = Array.from(
      {length: Math.min(usedV0, FREE_RESTORES_PER_MONTH)},
      () => ({day: today, kind: 'restore' as const, streakDays: 0}),
    );

    p = {
      ...p,
      habit: {
        type: 'cigarettes',
        amountPerDay: cigs,
        unitsPerPack: 20,
        pricePerPack,
        currencySymbol: typeof h.currencySymbol === 'string' ? h.currencySymbol : '$',
      },
      // best estimate of the original quit date: banked days before the
      // current streak started
      quitDate: addDays(streakStart, -bankedDays),
      streak: {streakStart, bankedDays, bestLifetime: 0},
      ledger,
      journal: Array.isArray(p.journal)
        ? p.journal.map(e =>
            isObj(e) && validIso(e.createdAt) ? {...e, day: dayKey(new Date(e.createdAt))} : e,
          )
        : [],
    };
  }

  return p;
}

/* --------------------------------- store --------------------------------- */

const pickData = (s: AppState): PersistedState => ({
  onboarded: s.onboarded,
  habit: s.habit,
  quitDate: s.quitDate,
  streak: s.streak,
  ledger: s.ledger,
  lastHeldAt: s.lastHeldAt,
  journal: s.journal,
  equipped: s.equipped,
  isPremium: s.isPremium,
});

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      today: todayKey(),
      celebrateOnboarding: false,
      ...freshData(todayKey()),

      syncToday: () => {
        const d = todayKey();
        const s = get();
        const streak = s.onboarded ? recordProgress(s.streak, d) : s.streak;
        if (s.today !== d || streak !== s.streak) set({today: d, streak});
      },

      setHabitType: type => {
        const h = get().habit;
        if (h.type === type) return;
        set({habit: {...defaultHabit(type), currencySymbol: h.currencySymbol}});
      },

      updateHabit: patch => set(s => ({habit: clampHabit({...s.habit, ...patch})})),

      setQuitDate: day => {
        const d = todayKey();
        if (!isDayKey(day)) return;
        const earliest = addDays(d, -MAX_QUIT_DAYS_AGO);
        const clamped = day > d ? d : day < earliest ? earliest : day;
        set({quitDate: clamped});
      },

      finishOnboarding: () => {
        const d = todayKey();
        const q = get().quitDate;
        const start = q && q <= d ? q : d;
        set({
          onboarded: true,
          today: d,
          quitDate: start,
          streak: recordProgress(newStreak(start), d),
          ledger: [],
          // Finishing onboarding is the first commitment: it counts as today's
          // hold, and Home opens on the companion waking up for it.
          lastHeldAt: d,
          celebrateOnboarding: true,
        });
      },

      clearCelebration: () => set({celebrateOnboarding: false}),

      logEntry: e => {
        const d = todayKey();
        set(state => {
          const existing = state.journal.find(j => j.day === d);
          const entry: JournalEntry = {
            id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            day: d,
            createdAt: new Date().toISOString(),
            craving: e.craving,
            triggers: e.triggers,
            mood: e.mood,
          };
          return {today: d, journal: [entry, ...state.journal.filter(j => j.day !== d)]};
        });
      },

      spendRestore: () => {
        const d = todayKey();
        const s = get();
        if (restoresLeft(s.ledger, d) <= 0) return;
        set({
          today: d,
          ledger: appendEvent(s.ledger, {
            day: d,
            kind: 'restore',
            streakDays: currentStreakDays(s.streak, d),
          }),
        });
      },

      // Starting over means today was NOT clean, so a "still clean" hold
      // already banked today no longer stands — the companion goes back to sleep.
      startOver: () => {
        const d = todayKey();
        const s = get();
        set({
          today: d,
          ledger: appendEvent(s.ledger, {
            day: d,
            kind: 'reset',
            streakDays: currentStreakDays(s.streak, d),
          }),
          streak: startOverStreak(s.streak, d),
          lastHeldAt: s.lastHeldAt && s.lastHeldAt >= d ? null : s.lastHeldAt,
        });
      },

      equip: id => {
        const s = get();
        const unlocked = unlockedCompanions(progressDays(s.streak, s.today));
        if (unlocked.includes(id)) set({equipped: id});
      },

      // Writes `today` too: if the clock hadn't ticked yet (a hold right after
      // midnight), "held today" must still match the day just banked.
      markHeld: () => {
        const d = todayKey();
        const s = get();
        set({
          today: d,
          lastHeldAt: s.lastHeldAt ? maxDay(s.lastHeldAt, d) : d,
          streak: recordProgress(s.streak, d),
        });
      },

      setPremium: v => set({isPremium: v}),

      resetAll: () => {
        const d = todayKey();
        set({today: d, celebrateOnboarding: false, ...freshData(d)});
      },
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => AsyncStorage),
      // Only the user's data is written; runtime fields never touch storage.
      partialize: pickData,
      migrate: (persisted, version) => migrateState(persisted, version, todayKey()) as AppState,
      merge: (persisted, current) => ({...current, ...cleanState(persisted, todayKey())}),
      // Fires on success, on empty storage (first launch) AND on a storage
      // error — in every case: stop the splash and bring dates up to today.
      onRehydrateStorage: () => () => {
        const d = todayKey();
        const s = useStore.getState();
        useStore.setState({
          hydrated: true,
          today: d,
          streak: s.onboarded ? recordProgress(s.streak, d) : s.streak,
        });
      },
    },
  ),
);
