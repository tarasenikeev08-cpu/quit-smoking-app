export type Habit = {
  /** what the user spent per month before quitting, in their currency */
  monthlySpend: number;
  /** cigarettes smoked per day before quitting */
  cigsPerDay: number;
  currencySymbol: string;
};

export const DEFAULT_HABIT: Habit = {
  monthlySpend: 120,
  cigsPerDay: 14,
  currencySymbol: '$',
};

const CIGS_PER_PACK = 20;

export function dailySpend(h: Habit): number {
  return h.monthlySpend / 30;
}

/** Money saved over the given clean days. */
export function moneySaved(h: Habit, days: number): number {
  return Math.round(dailySpend(h) * days);
}

/** Cigarettes not smoked over the given clean days. */
export function cigarettesAvoided(h: Habit, days: number): number {
  return Math.round(h.cigsPerDay * days);
}

/** Packs not bought (for the rank screen subtitle). */
export function packsNotBought(h: Habit, days: number): number {
  return Math.round(cigarettesAvoided(h, days) / CIGS_PER_PACK);
}

export function formatMoney(h: Habit, amount: number): string {
  return `${h.currencySymbol}${amount.toLocaleString()}`;
}

/** Infer a sensible cigs/day from monthly spend (≈ $0.50 per cigarette). */
export function inferCigsPerDay(monthlySpend: number, pricePerCig = 0.5): number {
  if (pricePerCig <= 0) return DEFAULT_HABIT.cigsPerDay;
  return Math.max(1, Math.round(monthlySpend / 30 / pricePerCig));
}
