import React, {createContext, useContext, useEffect, useMemo} from 'react';
import {
  cancelAnimation,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import {
  EASE_LINEAR,
  EASE_OUT,
  HOLD_DURATION,
  SPRING_HOP,
  SPRING_SETTLE,
  SPRING_WAKE,
} from './config';

/**
 * The wake engine.
 *
 * One set of shared values drives the WHOLE screen — companion, flame, embers,
 * background warmth and the hold bar all read from here, so the hold is a
 * single physical event rather than a button animating on its own.
 *
 *   wake      0 dormant .. 1 fully awake   (the master "aliveness" value)
 *   charge    0 .. 1 linear hold progress  (drives the bar fill exactly)
 *   pressing  0 / 1 finger down            (suppresses the inviting halo)
 *   celebrate 0 .. 1 completion pulse      (the hop and the flame flare)
 *   burst     0 .. 1 ember burst lifetime  (one-shot on completion)
 */
export type WakeEngine = {
  wake: SharedValue<number>;
  charge: SharedValue<number>;
  pressing: SharedValue<number>;
  celebrate: SharedValue<number>;
  burst: SharedValue<number>;
  /** true once today's hold is banked — the bright state persists all day */
  awake: boolean;
  /**
   * true while the screen is focused and the app is in the foreground. The
   * idle loops (breathing, flicker, halo, drifting embers) only run while this
   * holds, so a Home screen sitting behind another tab costs nothing.
   */
  active: boolean;
  start: () => void;
  abandon: () => void;
  complete: () => void;
};

const WakeContext = createContext<WakeEngine | null>(null);

export function useWakeEngine(awake: boolean, active: boolean): WakeEngine {
  const wake = useSharedValue(awake ? 1 : 0);
  const charge = useSharedValue(awake ? 1 : 0);
  const pressing = useSharedValue(0);
  const celebrate = useSharedValue(0);
  const burst = useSharedValue(0);

  // Keep the visual state in step with the persisted one. This matters at the
  // day rollover: `awake` flips back to false while the screen is mounted, and
  // the companion has to settle back to sleep rather than stay lit.
  useEffect(() => {
    if (awake) {
      charge.value = 1;
      wake.value = withSpring(1, SPRING_WAKE);
    } else {
      charge.value = withTiming(0, {duration: 450, easing: EASE_OUT});
      wake.value = withTiming(0, {duration: 650, easing: EASE_OUT});
    }
  }, [awake, wake, charge]);

  return useMemo<WakeEngine>(
    () => ({
      wake,
      charge,
      pressing,
      celebrate,
      burst,
      awake,
      active,

      /** finger down: start charging, and let the wake lead the bar slightly */
      start() {
        pressing.value = withTiming(1, {duration: 90});
        charge.value = withTiming(1, {duration: HOLD_DURATION, easing: EASE_LINEAR});
        // eased, so the companion stirs early and the last 20% is the payoff
        wake.value = withTiming(1, {duration: HOLD_DURATION, easing: EASE_OUT});
      },

      /** released early: everything reverses smoothly, nothing is logged */
      abandon() {
        cancelAnimation(charge);
        cancelAnimation(wake);
        pressing.value = withTiming(0, {duration: 160});
        charge.value = withTiming(0, {duration: 220, easing: EASE_OUT});
        wake.value = withSpring(0, SPRING_SETTLE);
      },

      /** held to the end: snap fully awake and fire the one-shot celebration */
      complete() {
        cancelAnimation(wake);
        pressing.value = withTiming(0, {duration: 120});
        charge.value = 1;
        wake.value = withSpring(1, SPRING_WAKE);
        celebrate.value = withSequence(
          withTiming(1, {duration: 150, easing: EASE_OUT}),
          withSpring(0, SPRING_HOP),
        );
        burst.value = 0;
        burst.value = withTiming(1, {duration: 1150, easing: EASE_LINEAR});
      },
    }),
    [wake, charge, pressing, celebrate, burst, awake, active],
  );
}

export function WakeProvider({
  engine,
  children,
}: {
  engine: WakeEngine;
  children: React.ReactNode;
}) {
  return <WakeContext.Provider value={engine}>{children}</WakeContext.Provider>;
}

export function useWake(): WakeEngine {
  const ctx = useContext(WakeContext);
  if (!ctx) throw new Error('useWake must be used inside a <WakeProvider>');
  return ctx;
}
