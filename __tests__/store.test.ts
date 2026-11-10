/**
 * The persisted store: what's written, how it rehydrates, and how the rules
 * hold up across real-world time changes — driven through the store actions.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useStore, STORE_KEY, STORE_VERSION, migrateState} from '../src/store';
import {currentStreakDays, lifetimeDays} from '../src/lib/streak';
import {restoresLeft} from '../src/lib/restores';
import {moneySaved, monthlySpend} from '../src/lib/savings';

const at = (y: number, mo: number, d: number, h = 12, mi = 0) => new Date(y, mo - 1, d, h, mi);
const flush = () => new Promise<void>(r => setImmediate(() => r()));
const saved = async () => JSON.parse((await AsyncStorage.getItem(STORE_KEY)) as string);

/**
 * An app restart: fresh memory, same disk. Wiping memory goes through
 * setState, which the persist middleware writes straight back to storage —
 * so put the disk contents back before rehydrating from them.
 */
async function restart() {
  const disk = await AsyncStorage.getItem(STORE_KEY);
  useStore.setState({hydrated: false, onboarded: false, journal: [], ledger: [], quitDate: null});
  await flush();
  if (disk === null) await AsyncStorage.removeItem(STORE_KEY);
  else await AsyncStorage.setItem(STORE_KEY, disk);
  await useStore.persist.rehydrate();
}

const S = () => useStore.getState();
const streak = () => currentStreakDays(S().streak, S().today);
const lifetime = () => lifetimeDays(S().streak, S().today);

beforeEach(async () => {
  jest.useFakeTimers({doNotFake: ['setImmediate', 'nextTick', 'queueMicrotask']});
  jest.setSystemTime(at(2026, 11, 10));
  await AsyncStorage.clear();
  useStore.getState().resetAll();
  await flush();
});
afterEach(() => jest.useRealTimers());

/** Run the onboarding the way the screens do. */
function onboard() {
  S().setHabitType('cigarettes');
  S().updateHabit({amountPerDay: 20, unitsPerPack: 20, pricePerPack: 15});
  S().setQuitDate('2026-11-05');
  S().finishOnboarding();
}

describe('onboarding drives real state', () => {
  test('quit date and inputs feed the streak and savings', () => {
    onboard();
    expect(S().onboarded).toBe(true);
    expect(S().streak.streakStart).toBe('2026-11-05');
    expect(streak()).toBe(5);
    expect(moneySaved(S().habit, lifetime())).toBe(75); // 1 pack/day x $15 x 5
  });

  test("finishing onboarding leaves day one's hold to the user", async () => {
    onboard();
    expect(S().lastHeldAt).toBeNull();
    expect(S().arrivedFromOnboarding).toBe(true);
    await flush();
    // a runtime cue, never written to disk
    expect((await saved()).state).not.toHaveProperty('arrivedFromOnboarding');
    S().markHeld();
    S().clearArrival();
    expect(S().lastHeldAt).toBe('2026-11-10');
    expect(S().arrivedFromOnboarding).toBe(false);
  });

  test('the default habit is the ~$120/month moderate smoker', () => {
    expect(Math.round(monthlySpend(S().habit))).toBe(122);
  });

  test('a quit date in the future is pulled back to today', () => {
    S().setQuitDate('2026-12-25');
    expect(S().quitDate).toBe('2026-11-10');
  });
});

describe('persistence', () => {
  test('writes the versioned user data — never runtime fields', async () => {
    onboard();
    await flush();
    const raw = await saved();
    expect(raw.version).toBe(STORE_VERSION);
    expect(raw.state.habit).toEqual({
      type: 'cigarettes', amountPerDay: 20, unitsPerPack: 20, pricePerPack: 15, currencySymbol: '$',
    });
    expect(raw.state.quitDate).toBe('2026-11-05');
    expect(raw.state).not.toHaveProperty('today');
    expect(raw.state).not.toHaveProperty('hydrated');
  });

  test('everything survives an app restart', async () => {
    onboard();
    S().markHeld();
    S().logEntry({craving: 4, triggers: ['Coffee'], mood: 2});
    S().spendRestore();
    await flush();

    await restart();
    expect(S().hydrated).toBe(true);
    expect(S().onboarded).toBe(true);
    expect(S().habit.pricePerPack).toBe(15);
    expect(S().quitDate).toBe('2026-11-05');
    expect(streak()).toBe(5);
    expect(S().lastHeldAt).toBe('2026-11-10');
    expect(S().journal).toHaveLength(1);
    expect(S().journal[0]).toMatchObject({day: '2026-11-10', craving: 4, triggers: ['Coffee']});
    expect(restoresLeft(S().ledger, S().today)).toBe(1);
  });

  test('first launch: empty storage hydrates to a clean, un-onboarded state', async () => {
    await AsyncStorage.clear();
    await restart();
    expect(S().hydrated).toBe(true);
    expect(S().onboarded).toBe(false);
    expect(S().quitDate).toBeNull();
  });

  test('corrupt storage falls back field by field instead of crashing', async () => {
    await AsyncStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        version: STORE_VERSION,
        state: {
          onboarded: true,
          habit: {type: 'snuff', amountPerDay: 'lots'},
          streak: {streakStart: 'yesterday', bankedDays: -4},
          ledger: [{day: 'nope', kind: 'restore'}],
          journal: [null, {id: 'x', createdAt: 'bad'}],
          equipped: 'phoenix', // not unlocked yet
        },
      }),
    );
    await restart();
    expect(S().habit.type).toBe('cigarettes');
    expect(Number.isFinite(S().habit.amountPerDay)).toBe(true);
    expect(S().streak.bankedDays).toBe(0);
    expect(S().ledger).toEqual([]);
    expect(S().journal).toEqual([]);
    expect(S().equipped).toBe('puff');
  });
});

describe('migration from v0 (the earlier shape)', () => {
  const v0 = {
    onboarded: true,
    habit: {monthlySpend: 120, cigsPerDay: 14, currencySymbol: '$'},
    streak: {streakStart: new Date(2026, 9, 31, 15, 0).toISOString(), bankedDays: 3, restoresLeft: 1},
    journal: [{id: 'a', createdAt: new Date(2026, 10, 9, 21, 0).toISOString(), craving: 3, triggers: ['Stress'], mood: 4}],
    equipped: 'sprout',
    isPremium: true,
    lastHeldAt: '2026-11-09',
  };

  test('rehydrating v0 data upgrades it without losing anything', async () => {
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify({version: 0, state: v0}));
    await restart();
    expect(S().onboarded).toBe(true);
    expect(S().streak.streakStart).toBe('2026-10-31');
    expect(S().streak.bankedDays).toBe(3);
    expect(lifetime()).toBe(3 + 10);
    expect(S().quitDate).toBe('2026-10-28');
    // the old monthly spend is preserved exactly as a pack price
    expect(moneySaved(S().habit, 30)).toBe(120);
    expect(S().journal[0].day).toBe('2026-11-09');
    expect(restoresLeft(S().ledger, S().today)).toBe(1); // one of two used
    expect(S().equipped).toBe('sprout');
    expect(S().isPremium).toBe(true);
    // and it's re-saved at the current version
    await flush();
    expect((await saved()).version).toBe(STORE_VERSION);
  });

  test('migrateState is a pure step function', () => {
    const out = migrateState(v0, 0, '2026-11-10') as any;
    expect(out.habit.type).toBe('cigarettes');
    expect(out.streak.bestLifetime).toBe(0);
  });
});

describe('time changes, through the store', () => {
  test('midnight rollover adds a clean day and re-opens the hold', () => {
    jest.setSystemTime(at(2026, 11, 10, 23, 59));
    onboard();
    S().markHeld();
    expect(streak()).toBe(5);

    jest.setSystemTime(at(2026, 11, 11, 0, 1));
    S().syncToday();
    expect(S().today).toBe('2026-11-11');
    expect(streak()).toBe(6);
    expect(S().lastHeldAt! >= S().today).toBe(false); // new day, hold open again
  });

  test('a missed day keeps counting — only a logged slip breaks the streak', () => {
    onboard();
    jest.setSystemTime(at(2026, 11, 13)); // the 11th and 12th: app never opened
    S().syncToday();
    expect(streak()).toBe(8);
  });

  test('a logged slip resets the streak, banks lifetime, keeps rank', () => {
    onboard();
    jest.setSystemTime(at(2026, 11, 20));
    S().syncToday();
    const life = lifetime(); // 15
    S().startOver();
    expect(streak()).toBe(0);
    expect(lifetime()).toBe(life);
    expect(S().ledger.at(-1)).toMatchObject({kind: 'reset', streakDays: 15});
  });

  test('free restores reset at the month boundary, and cannot overspend', () => {
    onboard();
    jest.setSystemTime(at(2026, 11, 30));
    S().syncToday();
    S().spendRestore();
    S().spendRestore();
    S().spendRestore(); // third one this month: ignored
    expect(S().ledger.filter(e => e.kind === 'restore')).toHaveLength(2);
    expect(restoresLeft(S().ledger, S().today)).toBe(0);

    jest.setSystemTime(at(2026, 12, 1, 0, 1));
    S().syncToday();
    expect(restoresLeft(S().ledger, S().today)).toBe(2);
  });

  test('checking in twice in a day updates that day, not a second entry', () => {
    onboard();
    S().logEntry({craving: 2, triggers: [], mood: 4});
    S().logEntry({craving: 5, triggers: ['Alcohol'], mood: 1});
    expect(S().journal).toHaveLength(1);
    expect(S().journal[0].craving).toBe(5);
    jest.setSystemTime(at(2026, 11, 11));
    S().logEntry({craving: 1, triggers: [], mood: 5});
    expect(S().journal.map(e => e.day)).toEqual(['2026-11-11', '2026-11-10']);
  });
});
