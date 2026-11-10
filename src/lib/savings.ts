/**
 * The user's habit, exactly as they described it in onboarding, and every
 * number derived from it (spend, money saved, amount avoided). Nothing here is
 * a placeholder: savings = what they told us they spent per day x clean days.
 */

export type HabitType = 'cigarettes' | 'rolling' | 'vape';

type Range = {default: number; step: number; min: number; max: number};

export type HabitSpec = {
  type: HabitType;
  /** chip label in onboarding */
  label: string;
  /** what one unit is called — "cigarette"/"cigarettes", short form for stats */
  unit: {one: string; many: string; short: string};
  /** what a pack is called */
  pack: {one: string; many: string};
  /** "You spend about $X a month on ___" */
  spendNoun: string;
  /** comparison bar label on the maths screen */
  barLabel: string;
  amount: Range;
  perPack: Range;
  price: Range;
};

export const HABITS: Record<HabitType, HabitSpec> = {
  cigarettes: {
    type: 'cigarettes',
    label: 'Cigarettes',
    unit: {one: 'cigarette', many: 'cigarettes', short: 'cigs'},
    pack: {one: 'pack', many: 'packs'},
    spendNoun: 'cigarettes',
    barLabel: 'Cigarettes / mo',
    amount: {default: 10, step: 1, min: 1, max: 80},
    perPack: {default: 20, step: 1, min: 1, max: 50},
    price: {default: 12, step: 0.5, min: 0.5, max: 200},
  },
  rolling: {
    type: 'rolling',
    label: 'Rolling tobacco',
    unit: {one: 'roll-up', many: 'roll-ups', short: 'roll-ups'},
    pack: {one: 'pouch', many: 'pouches'},
    spendNoun: 'rolling tobacco',
    barLabel: 'Tobacco / mo',
    amount: {default: 10, step: 1, min: 1, max: 80},
    perPack: {default: 50, step: 5, min: 5, max: 200},
    price: {default: 30, step: 0.5, min: 0.5, max: 200},
  },
  vape: {
    type: 'vape',
    label: 'Vape',
    unit: {one: 'pod', many: 'pods', short: 'pods'},
    pack: {one: 'pack', many: 'packs'},
    spendNoun: 'vaping',
    barLabel: 'Vaping / mo',
    amount: {default: 1, step: 0.5, min: 0.5, max: 20},
    perPack: {default: 4, step: 1, min: 1, max: 20},
    price: {default: 16, step: 0.5, min: 0.5, max: 200},
  },
};

export const HABIT_TYPES: HabitType[] = ['cigarettes', 'rolling', 'vape'];

export type Habit = {
  type: HabitType;
  /** units used per day before quitting (cigarettes, roll-ups, pods) */
  amountPerDay: number;
  /** price of one pack / pouch */
  pricePerPack: number;
  /** units in one pack / pouch */
  unitsPerPack: number;
  currencySymbol: string;
};

export function defaultHabit(type: HabitType = 'cigarettes'): Habit {
  const s = HABITS[type];
  return {
    type,
    amountPerDay: s.amount.default,
    pricePerPack: s.price.default,
    unitsPerPack: s.perPack.default,
    currencySymbol: '$',
  };
}

export const DEFAULT_HABIT: Habit = defaultHabit();

const clamp = (v: number, r: Range) => Math.min(r.max, Math.max(r.min, v));
/** round away float noise so 0.1 + 0.2 never shows as 0.30000000000000004 */
const round = (v: number, places: number) => Math.round(v * 10 ** places) / 10 ** places;

/**
 * Keep a habit inside its type's valid ranges. Values are rounded, not
 * snapped to the stepper grid, so a migrated price like $5.71 stays exact.
 */
export function clampHabit(h: Habit): Habit {
  const s = HABITS[h.type];
  return {
    ...h,
    amountPerDay: round(clamp(h.amountPerDay, s.amount), 1),
    pricePerPack: round(clamp(h.pricePerPack, s.price), 2),
    unitsPerPack: Math.round(clamp(h.unitsPerPack, s.perPack)),
  };
}

/** What the habit cost per day. */
export function dailySpend(h: Habit): number {
  return (h.amountPerDay / h.unitsPerPack) * h.pricePerPack;
}

/** Average month (365/12 days), for the onboarding comparison. */
export function monthlySpend(h: Habit): number {
  return dailySpend(h) * (365 / 12);
}

/** Money not spent over the given clean days, whole currency units. */
export function moneySaved(h: Habit, days: number): number {
  return Math.round(dailySpend(h) * days);
}

/** Cigarettes / roll-ups / pods not used over the given clean days. */
export function unitsAvoided(h: Habit, days: number): number {
  return Math.round(h.amountPerDay * days);
}

/** Packs / pouches not bought (for the rank screen subtitle). */
export function packsNotBought(h: Habit, days: number): number {
  return Math.round(unitsAvoided(h, days) / h.unitsPerPack);
}

/** "$1,234" — or "$12.50" with cents for prices. */
export function formatMoney(h: Habit, amount: number, cents = false): string {
  const n = cents
    ? amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
    : Math.round(amount).toLocaleString('en-US');
  return `${h.currencySymbol}${n}`;
}

/** "1", "0.5", "12.5" — amounts without trailing zeros. */
export const formatAmount = (n: number): string =>
  Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, '');
