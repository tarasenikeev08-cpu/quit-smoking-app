/**
 * ──────────────────────────────────────────────────────────────────────────
 *  MOCK PURCHASE SERVICE  —  STUB, NOT A REAL PAYMENT INTEGRATION
 * ──────────────────────────────────────────────────────────────────────────
 *  The payment provider is NOT finalised. This module fakes an offering and a
 *  "purchase" so the paywall UI and entitlement gate are fully clickable.
 *
 *  A mock "purchase" simply flips `isPremium` in the store — NO money moves,
 *  NO receipts, NO server validation.
 *
 *  TODO(payments): replace this file with a real provider (e.g. RevenueCat
 *  `react-native-purchases`, or StoreKit / Play Billing directly):
 *    1. Install the SDK and add iOS/Android native config.
 *    2. Configure products + an entitlement in the provider dashboard.
 *    3. Implement getOffering()/purchase()/restore() against the SDK.
 *    4. Drive `useStore.getState().setPremium(...)` from the real entitlement,
 *       ideally also verified server-side (see src/services/data.ts).
 * ──────────────────────────────────────────────────────────────────────────
 */
import {useStore} from '@/store';

export type MockPlan = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  strikePrice?: string;
  discountLabel: string;
  ctaLabel: string;
};

const MOCK_PLAN: MockPlan = {
  id: 'ember_monthly_intro',
  title: 'First month',
  subtitle: 'then $5 / month',
  price: '$3',
  strikePrice: '$5',
  discountLabel: '40% OFF',
  ctaLabel: 'Claim 40% off',
};

function wait<T>(value: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

/** STUB: returns a hard-coded plan. Replace with real offering fetch. */
export async function getOffering(): Promise<MockPlan> {
  return wait(MOCK_PLAN);
}

/** STUB: fakes a successful purchase by granting premium locally. */
export async function purchase(_planId: string): Promise<boolean> {
  await wait(null, 600);
  useStore.getState().setPremium(true); // TODO(payments): drive from real entitlement
  return true;
}

/** STUB: fakes "restore purchases". No real receipts to restore yet. */
export async function restore(): Promise<boolean> {
  await wait(null, 400);
  // TODO(payments): query the provider for an existing entitlement.
  return useStore.getState().isPremium;
}

/** STUB flag so UI can show "demo mode" if desired. */
export const IS_MOCK_PAYMENTS = true;
