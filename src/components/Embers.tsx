import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {colors} from '@/theme';
import {EASE_LINEAR, EMBER_COUNT} from '@/anim/config';
import {useWake} from '@/anim/wake';

/**
 * Sparks off the flame.
 *
 * Two behaviours from one particle pool:
 *   charging   — embers drift upward on a loop, denser as the hold charges
 *   completion — the same particles are thrown outward with real velocity and
 *                gravity, so the burst has weight instead of just scaling up
 *
 * Each particle carries a fixed random seed so the field never looks gridded,
 * and positions are integrated in the worklet (x = vx·t, y = vy·t + ½gt²).
 */

type Spark = {
  /** drift phase offset, 0..1 — staggers the looping rise */
  phase: number;
  /** horizontal wander while drifting */
  driftX: number;
  /** burst velocity, px/s */
  vx: number;
  vy: number;
  size: number;
  /** burst particles die at slightly different times */
  life: number;
};

const GRAVITY = 620; // px/s² — tuned so the arc reads at phone scale

function makeSparks(count: number, spread: number): Spark[] {
  const out: Spark[] = [];
  for (let i = 0; i < count; i++) {
    // even angular spread with jitter, biased upward
    const a = (-Math.PI / 2) + (i / count - 0.5) * 2.5 + (Math.random() - 0.5) * 0.4;
    const speed = spread * (0.55 + Math.random() * 0.75);
    out.push({
      phase: i / count + Math.random() * 0.06,
      driftX: (Math.random() - 0.5) * spread * 0.5,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      size: 1.6 + Math.random() * 2.4,
      life: 0.62 + Math.random() * 0.38,
    });
  }
  return out;
}

/**
 * `size` is the flame's own size (it sets the drift height); `spread` is how
 * far the completion burst throws, in px/s, and is deliberately independent
 * of the flame so a small flame can still throw a big burst.
 */
export default function Embers({size, spread}: {size: number; spread: number}) {
  const {wake, burst, pressing, active} = useWake();
  const sparks = useMemo(() => makeSparks(EMBER_COUNT, spread), [spread]);

  // one shared clock for the looping drift
  const drift = useSharedValue(0);
  React.useEffect(() => {
    if (!active) {
      cancelAnimation(drift);
      return;
    }
    drift.value = 0;
    drift.value = withRepeat(withTiming(1, {duration: 1800, easing: EASE_LINEAR}), -1, false);
    return () => cancelAnimation(drift);
  }, [active, drift]);

  return (
    <View style={styles.field} pointerEvents="none">
      {sparks.map((s, i) => (
        <Ember key={i} spark={s} wake={wake} burst={burst} pressing={pressing} drift={drift} rise={size * 2.6} />
      ))}
    </View>
  );
}

function Ember({
  spark,
  wake,
  burst,
  pressing,
  drift,
  rise,
}: {
  spark: Spark;
  wake: ReturnType<typeof useWake>['wake'];
  burst: ReturnType<typeof useWake>['burst'];
  pressing: ReturnType<typeof useWake>['pressing'];
  drift: ReturnType<typeof useWake>['wake'];
  rise: number;
}) {
  const style = useAnimatedStyle(() => {
    const b = burst.value;

    // ---- completion burst: ballistic, with gravity ----
    if (b > 0 && b < 1) {
      const t = (b / spark.life) * 0.95; // seconds of flight
      if (t >= 1) return {opacity: 0};
      const x = spark.vx * t;
      const y = spark.vy * t + 0.5 * GRAVITY * t * t * 0.55;
      return {
        opacity: interpolate(t, [0, 0.12, 0.75, 1], [0, 1, 0.8, 0], Extrapolation.CLAMP),
        transform: [
          {translateX: x},
          {translateY: y},
          {scale: interpolate(t, [0, 1], [1.15, 0.35], Extrapolation.CLAMP)},
        ],
      };
    }

    // ---- charging drift: a slow upward column of embers ----
    // density follows the hold, so a dormant screen is perfectly still
    const density = Math.max(0, wake.value * 0.75 + pressing.value * 0.25 - 0.18);
    // dormant: invisible, so return a constant and stop pushing frame updates
    if (density <= 0) {
      return {opacity: 0, transform: [{translateX: 0}, {translateY: 0}, {scale: 1}]};
    }
    const t = (drift.value + spark.phase) % 1;
    return {
      opacity:
        density * interpolate(t, [0, 0.2, 0.7, 1], [0, 0.75, 0.45, 0], Extrapolation.CLAMP),
      transform: [
        {translateX: spark.driftX * Math.sin(t * Math.PI * 2)},
        {translateY: -t * rise},
        {scale: interpolate(t, [0, 1], [1, 0.4], Extrapolation.CLAMP)},
      ],
    };
  }, [burst, wake, pressing, drift, spark, rise]);

  return (
    <Animated.View
      style={[
        styles.spark,
        {width: spark.size, height: spark.size, borderRadius: spark.size / 2},
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: {position: 'absolute', backgroundColor: colors.accent2},
});
