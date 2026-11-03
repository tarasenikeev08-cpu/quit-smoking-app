# Ember — quit-smoking streak tracker

React Native (bare) app. Warm-paper palette, amber flame as the only colour
accent, ink line-art companions — per `Ember_Design_Reference.html`.

> **Status:** UI shell + local domain logic complete and running on-device.
> **Backend (Supabase) and payments (RevenueCat/provider TBD) are STUBBED** —
> see [Stubs](#stubs). No network calls, no accounts, no real billing yet.

## Run it in a browser (quickest — no native build)

```bash
npm install
```

```bash
npm run web
```

Then open **http://localhost:5173** in Chrome. This runs the exact same screens,
navigation, and logic via **react-native-web** (webpack dev server, hot reload).
Everything is usable: onboard, build a streak, check in, earn ranks, unlock and
equip companions, run the slip/restore flow. Native-only bits (home-screen
widget, haptics) are no-ops on web — see `src/lib/platform.ts`.

> Web plumbing: `webpack.config.js`, `index.web.js`, `public/index.html`. The
> `react-native` → `react-native-web` mapping needs two native-only exports that
> RNW doesn't ship; those are added via `patches/react-native-web+*.patch`
> (applied automatically on `npm install` by `patch-package`).

## Run it on device (macOS)

```bash
cp .env.example .env    # optional; only needed once the backend/payments are wired
```

iOS (needs Xcode + CocoaPods):

```bash
cd ios && pod install && cd ..
npm run ios
```

Android (needs Android Studio + a running emulator or device):

```bash
npm run android
```

The app is fully usable offline today.

```bash
npm run typecheck   # tsc --noEmit (passes)
npm test            # jest
```

## Architecture

```
src/
  theme/            design tokens (colours, type, spacing, strokes)
  components/       Flame, Companion, Icon, Screen, ui primitives
  lib/              pure domain logic — streak, ranks, companions, savings, journal
  store/            Zustand store (AsyncStorage-persisted) + selectors
  screens/          onboarding · home · rank · journal · collection · slip
  navigation/       root gate, tabs, onboarding + journal stacks, custom TabBar
  services/         STUBS — data.ts (backend), purchases.ts (payments)
supabase/schema.sql draft schema + RLS for the eventual Supabase wiring
```

State is **local-first**: the Zustand store is the source of truth and persists
to the device. A backend only mirrors it later.

### Streak vs. lifetime days (by design)

The engine tracks **two separate values** (`src/lib/streak.ts`):

- **Current streak** — consecutive clean days since `streakStart`; this is what
  a slip can break.
- **Lifetime clean days** — `bankedDays + currentStreak`; **drives rank and
  savings** and is *never* reduced by a slip.

So a slip (start-over) banks the current streak into lifetime, then resets the
streak to day 1 — your rank, unlocked companions, and savings stay intact. A
"restore" keeps the streak entirely (2 free restores). See `src/lib/ranks.ts`
for the 9-rank / 9-companion ladder keyed off lifetime days.

## Stubs

Both are isolated, clearly marked, and safe to run — the UI treats them as if
real.

| Stub | File | What it fakes | What it needs from you later |
|------|------|---------------|------------------------------|
| **Payments** | `src/services/purchases.ts` | A hard-coded offering; "purchase" just flips `isPremium` locally | Final provider decision (RevenueCat drafted); SDK install + native config; products + entitlement in dashboard; public SDK keys in `.env` |
| **Backend/sync** | `src/services/data.ts` | No-op `initSync/pushState/pullState` | Supabase project; run `supabase/schema.sql`; enable anonymous sign-ins; `SUPABASE_URL` + `SUPABASE_ANON_KEY` in `.env`; implement the three functions |

`.env.example` and `supabase/schema.sql` are already in place for when you wire
these. Env plumbing (`react-native-dotenv`, `@env`) is configured in
`babel.config.js`.
