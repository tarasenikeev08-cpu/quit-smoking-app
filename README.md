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
cd ios && pod install && cd ..   # required: Reanimated, worklets, haptics are native modules
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
  theme/            design tokens (colours, type, spacing, strokes) + metrics
  anim/             the wake engine — shared motion state + motion tokens
  components/       Companion, LiveFlame, Embers, WarmWash, HoldButton, ui
  lib/              pure domain logic — streak, ranks, companions, savings, journal
                    plus haptics.ts / haptics.web.ts (native taptics, web no-op)
  store/            Zustand store (AsyncStorage-persisted) + selectors
  screens/          onboarding · home · rank · journal · collection · slip
  navigation/       root gate, tabs, onboarding + journal stacks, custom TabBar
  services/         STUBS — data.ts (backend), purchases.ts (payments)
supabase/schema.sql draft schema + RLS for the eventual Supabase wiring
```

State is **local-first**: the Zustand store is the source of truth and persists
to the device. A backend only mirrors it later. Persisted state is validated
field by field on load (`mergePersisted` in `src/store/index.ts`), so a partial
or older saved state falls back to defaults instead of rendering `NaN`.

**The day clock.** Everything date-based (streak count, "held today") derives
from the store's runtime-only `today`, which `src/lib/clock.ts` advances just
after local midnight and whenever the app returns to the foreground. Selectors
must read `today`, never call `dayjs()` themselves — a selector only re-runs on
a store change, so one reading the wall clock would freeze on the day it last
rendered.

### The daily hold (`src/anim/`)

The hold is the app's one real interaction, so it is built as a **single
screen-wide event** rather than a button animation. `useWakeEngine()` owns a
small set of Reanimated shared values:

| Value | Meaning |
|---|---|
| `wake` | 0 dormant → 1 fully awake — the master "aliveness" value |
| `charge` | 0 → 1 linear hold progress, drives the bar fill exactly |
| `pressing` | 0/1 finger down — suppresses the inviting halo |
| `celebrate` | one-shot completion pulse — the hop and the flame flare |
| `burst` | one-shot ember-burst lifetime |

Everything on Home reads from them, so the companion, flame, embers, hold bar
and background warmth all move as one. Releasing early springs `wake` back and
logs nothing; completing it banks the day and the bright state persists until
the next rollover.

Animation is **transforms and opacity only** — the dim and bright drawings are
stacked and cross-faded rather than restyled, so every frame stays on the
compositor and the reference artwork is never redrawn. Haptics are native-only
(`haptic()` is a no-op on web); the visuals are identical on both.

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
