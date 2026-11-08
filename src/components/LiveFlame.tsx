import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {colors} from '@/theme';
import {EASE_IN_OUT} from '@/anim/config';
import {useWake} from '@/anim/wake';

const RATIO = 120 / 96;

/** The three nested flame bodies, exactly as drawn in the design reference. */
const OUTER =
  'M48 16 C40 40 20 48 24 76 C26 100 42 110 48 110 C54 110 70 100 72 76 C76 48 56 40 48 16Z';
const MID =
  'M48 40 C43 56 33 62 36 80 C38 96 44 104 48 104 C52 104 58 96 60 80 C63 62 53 56 48 40Z';
const CORE =
  'M48 62 C45 72 40 76 42 86 C43 94 46 98 48 98 C50 98 53 94 54 86 C56 76 51 72 48 62Z';

/**
 * One lick's transform. A worklet so it runs on the UI thread with the rest
 * of the flicker. `t` is -0.5..0.5, `amp` scales the whole motion with wake.
 */
function lick(t: number, sway: number, stretch: number, amp: number, height: number) {
  'worklet';
  return {
    transform: [
      {translateY: height * 0.5},
      {scaleY: 1 + t * stretch * amp},
      {scaleX: 1 - t * stretch * 0.55 * amp},
      {translateY: -height * 0.5},
      {translateX: t * sway * amp},
      {rotate: `${t * sway * 0.9 * amp}deg`},
    ],
  };
}

/** One flame body, transformed by its own flicker clock. */
function Lick({
  d,
  color,
  style,
  w,
  h,
}: {
  d: string;
  color: string;
  style: ReturnType<typeof useAnimatedStyle>;
  w: number;
  h: number;
}) {
  return (
    <Animated.View style={[styles.layer, style]} pointerEvents="none">
      <Svg width={w} height={h} viewBox="0 0 96 120">
        <Path d={d} fill={color} />
      </Svg>
    </Animated.View>
  );
}

/**
 * The streak flame — a dim grey ember while dormant, catching and burning
 * when the companion wakes.
 *
 * The flicker is procedural: each layer runs its own loop at a different,
 * deliberately non-harmonic period, so the three never line up and the
 * motion never reads as a repeating loop. Amplitude scales with wake, so a
 * cold ember sits still and a lit flame dances.
 */
export default function LiveFlame({size}: {size: number}) {
  const {wake, celebrate} = useWake();
  const width = size;
  const height = size * RATIO;

  // non-harmonic periods: the layers drift in and out of phase forever
  const f1 = useSharedValue(0);
  const f2 = useSharedValue(0);
  const f3 = useSharedValue(0);

  useEffect(() => {
    f1.value = withRepeat(withTiming(1, {duration: 430, easing: EASE_IN_OUT}), -1, true);
    f2.value = withRepeat(withTiming(1, {duration: 670, easing: EASE_IN_OUT}), -1, true);
    f3.value = withRepeat(withTiming(1, {duration: 310, easing: EASE_IN_OUT}), -1, true);
  }, [f1, f2, f3]);

  /** Whole-flame: grows as it catches, flares on completion. */
  const bodyStyle = useAnimatedStyle(() => {
    const w = wake.value;
    const flare = celebrate.value;
    return {
      transform: [
        {scale: interpolate(w, [0, 1], [0.8, 1], Extrapolation.CLAMP) * (1 + flare * 0.45)},
        {translateY: -flare * 4},
      ],
    };
  });

  /** Cold grey ember, fading out as the flame catches. */
  const emberStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wake.value, [0, 0.55], [1, 0], Extrapolation.CLAMP),
  }));

  /** The lit flame, fading in. */
  const litStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wake.value, [0.15, 0.7], [0, 1], Extrapolation.CLAMP),
  }));

  // Each layer is a lick of flame leaning and stretching on its own clock.
  // Written out rather than generated in a loop so every useAnimatedStyle is
  // a plain top-level hook call.
  const outerStyle = useAnimatedStyle(() => {
    const amp = interpolate(wake.value, [0, 1], [0.12, 1], Extrapolation.CLAMP);
    return lick(f2.value - 0.5, size * 0.055, 0.1, amp, height);
  });
  const midStyle = useAnimatedStyle(() => {
    const amp = interpolate(wake.value, [0, 1], [0.12, 1], Extrapolation.CLAMP);
    return lick(f1.value - 0.5, size * 0.085, 0.17, amp, height);
  });
  const coreStyle = useAnimatedStyle(() => {
    const amp = interpolate(wake.value, [0, 1], [0.12, 1], Extrapolation.CLAMP);
    return lick(f3.value - 0.5, size * 0.1, 0.24, amp, height);
  });

  return (
    <View style={{width, height}}>
      <Animated.View style={[styles.layer, bodyStyle]}>
        {/* cold ember */}
        <Animated.View style={[styles.layer, emberStyle]} pointerEvents="none">
          <Svg width={width} height={height} viewBox="0 0 96 120">
            <Path d={OUTER} fill="#B7B5AC" />
            <Path d={MID} fill="#C9C7BE" />
          </Svg>
        </Animated.View>

        {/* lit flame — three independently flickering licks */}
        <Animated.View style={[styles.layer, litStyle]} pointerEvents="none">
          <Lick d={OUTER} color={colors.accent} style={outerStyle} w={width} h={height} />
          <Lick d={MID} color={colors.accent2} style={midStyle} w={width} h={height} />
          <Lick d={CORE} color={colors.accent3} style={coreStyle} w={width} h={height} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0},
});
