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

> `npm run web` first checks every dependency in `package.json` is actually
> installed, and runs `npm install` for you if anything is missing — so after
> pulling commits that add a package, the web build doesn't fail with
> "Module not found: Can't resolve '…'". (`scripts/ensure-deps.js`)


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

### Local-first persistence (`src/store/`, `src/lib/`)

Everything lives on the device — no account, no backend. The Zustand store is
persisted to **AsyncStorage** (localStorage on web) and rehydrated on launch;
the app shows a splash until that read finishes, then routes a **first launch**
(nothing stored) to onboarding and a **returning user** straight home.

What is stored — only the user's own inputs and events; every number on screen
is derived from them, so nothing can drift out of sync:

| Stored | Derived from it |
|---|---|
| habit: type, amount/day, price per pack, units per pack | spend, money saved, amount avoided, packs |
| quit date, current streak start, banked days | current streak, lifetime clean days |
| lifetime high-water mark | rank, unlocked companions (can't be lost to a clock change) |
| slip ledger (restore / reset, with date) | free restores left this month |
| last-held day, journal (one entry per day) | "held today", insights, check-in streak |
| equipped companion, onboarding-complete flag | — |

**Rules (each covered by a test in `__tests__/`):**
- **Dates are calendar-day keys** (`2026-11-10`), never timestamps, and day
  arithmetic is done on the calendar — so travel and daylight saving can't
  shift a streak. `npm run test:tz` runs the suite in five timezones.
- **Streak and lifetime are separate.** A logged slip (start over) banks the
  current streak into lifetime and restarts it today; lifetime, rank, savings
  and companions never go down.
- **A missed day doesn't break the streak** — not opening the app isn't a
  slip. (It does break the separate check-in streak.)
- **Free restores: 2 per calendar month**, counted from the ledger, so they
  reset on the 1st with no write needed.
- **Midnight / resume:** `src/lib/clock.ts` advances the store's `today` at
  local midnight and when the app returns to the foreground.

**Schema changes:** the persisted data carries a version (`STORE_VERSION`).
Changing its shape means bumping the version and adding a step to
`migrateState` — earlier data (v0, from before onboarding collected real
inputs) is upgraded in place, keeping the user's exact savings. On load every
field is also validated individually, so partial or corrupt data falls back
per field instead of crashing.

**Reinstall on the same device:** the data is included in normal device
backups — Android Auto Backup (`android:allowBackup` + `res/xml/*backup*` rules
for AsyncStorage's `RKStorage` database) and iCloud
(`RCTAsyncStorageExcludeFromBackup = false` in `Info.plist`; AsyncStorage
excludes itself by default). Restoring the backup restores the app's state.

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
