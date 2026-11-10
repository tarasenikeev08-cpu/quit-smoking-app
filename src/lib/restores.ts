import {DayKey, monthOf} from './days';

/** Free streak restores available each calendar month. */
export const FREE_RESTORES_PER_MONTH = 2;

/** Cap on stored events — a ledger of years of slips is still tiny. */
const MAX_EVENTS = 500;

/**
 * The slip ledger: every logged slip, and how it was handled.
 *   restore — a free restore was spent; the streak survived
 *   reset   — the user started over; the streak was banked into lifetime
 *
 * Restores left this month are DERIVED from it rather than stored as a
 * counter, so the monthly reset needs no write: when the calendar month
 * changes, last month's restores simply stop counting.
 */
export type LedgerEvent = {
  day: DayKey;
  kind: 'restore' | 'reset';
  /** the streak length at the moment of the slip */
  streakDays: number;
};

export function restoresUsedInMonth(ledger: LedgerEvent[], today: DayKey): number {
  const month = monthOf(today);
  return ledger.filter(e => e.kind === 'restore' && monthOf(e.day) === month).length;
}

export function restoresLeft(ledger: LedgerEvent[], today: DayKey): number {
  return Math.max(0, FREE_RESTORES_PER_MONTH - restoresUsedInMonth(ledger, today));
}

export function appendEvent(ledger: LedgerEvent[], event: LedgerEvent): LedgerEvent[] {
  const next = [...ledger, event];
  return next.length > MAX_EVENTS ? next.slice(next.length - MAX_EVENTS) : next;
}
