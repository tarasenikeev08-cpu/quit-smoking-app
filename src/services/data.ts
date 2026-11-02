/**
 * ──────────────────────────────────────────────────────────────────────────
 *  MOCK DATA / SYNC LAYER  —  STUB, NOT A REAL BACKEND
 * ──────────────────────────────────────────────────────────────────────────
 *  The app is LOCAL-FIRST today: all state lives on-device in the Zustand store
 *  (persisted to AsyncStorage in src/store/index.ts). There is NO account, NO
 *  cloud sync, NO server. These functions are no-op placeholders so the rest of
 *  the app can call a stable sync API that a real backend will later fulfil.
 *
 *  Chosen backend (per project decision): Supabase. The SQL schema and RLS
 *  policies are already drafted in `supabase/schema.sql` for when you wire it.
 *
 *  TODO(backend): implement against Supabase (or whichever backend):
 *    1. `npm i @supabase/supabase-js react-native-url-polyfill`.
 *    2. Add SUPABASE_URL / SUPABASE_ANON_KEY to `.env` (see .env.example).
 *    3. Run supabase/schema.sql in the project; enable anonymous sign-ins.
 *    4. Implement initSync (auth + initial pull), pushState (debounced upsert),
 *       pullState (merge remote → store). A reference implementation outline is
 *       in the git history / README.
 * ──────────────────────────────────────────────────────────────────────────
 */

/** STUB: would sign in and do an initial pull. Currently does nothing. */
export async function initSync(): Promise<void> {
  // no-op: local-first. TODO(backend): auth + pullState().
}

/** STUB: would push local state to the backend. Currently does nothing. */
export async function pushState(): Promise<void> {
  // no-op. TODO(backend): debounced upsert of profile + journal rows.
}

/** STUB: would pull remote state and merge. Currently does nothing. */
export async function pullState(): Promise<void> {
  // no-op. TODO(backend): fetch + merge into the store.
}

/** STUB: tears down any sync subscriptions. No-op today. */
export function stopSync(): void {
  // no-op.
}

/** STUB flag so UI can indicate "offline/local-only" if desired. */
export const IS_MOCK_BACKEND = true;
