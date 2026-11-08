import React, {useCallback, useEffect, useRef, useState} from 'react';
import {LayoutChangeEvent, Pressable, StyleSheet, Text, View} from 'react-native';
import Svg, {Defs, LinearGradient, RadialGradient, Rect, Stop} from 'react-native-svg';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {EASE_IN_OUT, HOLD_DURATION} from '@/anim/config';
import {useWake} from '@/anim/wake';
import {haptic} from '@/lib/platform';

export {HOLD_DURATION};

type Props = {
  /** fired once the hold completes */
  onComplete: () => void;
  /** the companion's name, for the label */
  companionName: string;
};

/** Haptic ticks while charging — accelerating, so the press feels like it's winding up. */
const TICKS = [170, 380, 610, 810, 970, 1090];

/**
 * Press-and-hold to wake the companion.
 *
 * The bar is the handle on the whole-screen interaction: it drives the shared
 * wake engine, so the companion, flame, embers and background all charge with
 * it. Locally it renders the fill sweep, a warm burning edge at the fill
 * boundary, the label inverting to paper as the fill passes under it, and —
 * while dormant and untouched — a slow warm halo quietly inviting the press.
 *
 * Releasing early reverses everything and logs nothing.
 */
export default function HoldButton({onComplete, companionName}: Props) {
  const m = useMetrics();
  const {wake, charge, pressing, celebrate, awake, start, abandon, complete} = useWake();

  const [width, setWidth] = useState(0);
  const done = useRef(awake);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // slow breathing halo, running whenever the bar is inviting a press
  const halo = useSharedValue(0);
  useEffect(() => {
    halo.value = withRepeat(withTiming(1, {duration: 1900, easing: EASE_IN_OUT}), -1, true);
  }, [halo]);

  useEffect(() => {
    done.current = awake;
  }, [awake]);

  const clearTimers = useCallback(() => {
    if (finishTimer.current) clearTimeout(finishTimer.current);
    finishTimer.current = null;
    tickTimers.current.forEach(clearTimeout);
    tickTimers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const pressIn = () => {
    if (done.current) return;
    clearTimers();
    start();
    haptic('light');
    // accelerating ticks as the charge builds
    tickTimers.current = TICKS.map(at => setTimeout(() => haptic('tick'), at));
    finishTimer.current = setTimeout(() => {
      done.current = true;
      clearTimers();
      complete();
      haptic('success');
      onComplete();
    }, HOLD_DURATION);
  };

  const pressOut = () => {
    if (done.current) return;
    clearTimers();
    abandon();
  };

  const label = awake ? `${companionName} is awake` : `Hold to wake ${companionName}`;

  /** Warm halo behind the bar — only while dormant and not being pressed. */
  const haloStyle = useAnimatedStyle(() => {
    const inviting = (1 - wake.value) * (1 - pressing.value);
    return {
      opacity: inviting * interpolate(halo.value, [0, 1], [0.45, 0.85]),
      transform: [{scale: interpolate(halo.value, [0, 1], [0.94, 1.04])}],
    };
  });

  /** The bar presses in, then springs with the celebration. */
  const barStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1 - pressing.value * 0.02 + celebrate.value * 0.035}],
  }));

  /** Ink fill sweeping left to right, exactly tracking hold progress. */
  const fillStyle = useAnimatedStyle(() => ({
    width: `${charge.value * 100}%`,
  }));

  /** A hot edge burning along the fill boundary while charging. */
  const edgeStyle = useAnimatedStyle(() => {
    const live = pressing.value * (charge.value > 0.002 && charge.value < 0.999 ? 1 : 0);
    return {
      opacity: live * interpolate(halo.value, [0, 1], [0.75, 1]),
      transform: [{translateX: charge.value * width}, {scaleY: 1 + halo.value * 0.08}],
    };
  });

  /** Paper-coloured copy of the label, revealed by a clip tracking the fill. */
  const clipStyle = useAnimatedStyle(() => ({
    width: `${charge.value * 100}%`,
  }));

  return (
    <View>
      {/* inviting halo — a soft radial glow, not a slab */}
      <Animated.View style={[styles.halo, haloStyle]} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="holdHalo" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0" stopColor={colors.accent} stopOpacity="0.95" />
              <Stop offset="0.45" stopColor={colors.accent} stopOpacity="0.5" />
              <Stop offset="0.72" stopColor={colors.accent2} stopOpacity="0.2" />
              <Stop offset="1" stopColor={colors.accent2} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#holdHalo)" />
        </Svg>
      </Animated.View>

      <Animated.View style={barStyle}>
        <Pressable
          onPressIn={pressIn}
          onPressOut={pressOut}
          onLayout={onLayout}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint={awake ? undefined : 'Press and hold for just over a second'}
          // react-native-web: data-* attributes land on the DOM node, so the
          // stylesheet's [data-hold-target="true"] rule applies touch-action:none.
          // (RN's Pressable type has no dataSet prop; RN Web reads it at runtime.)
          {...({dataSet: {holdTarget: 'true'}} as any)}
          style={[
            styles.track,
            styles.noSelect,
            {height: m.controls.hold.height, borderRadius: m.controls.hold.radius},
          ]}>
          {/* ink fill sweeping left -> right */}
          <Animated.View style={[styles.fill, fillStyle]} />

          {/* burning edge at the fill boundary — hot core fading both ways */}
          <Animated.View style={[styles.edge, edgeStyle]} pointerEvents="none">
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="holdEdge" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={colors.accent} stopOpacity="0" />
                  <Stop offset="0.38" stopColor={colors.accent} stopOpacity="0.85" />
                  <Stop offset="0.5" stopColor={colors.accent3} stopOpacity="1" />
                  <Stop offset="0.62" stopColor={colors.accent2} stopOpacity="0.8" />
                  <Stop offset="1" stopColor={colors.accent2} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#holdEdge)" />
            </Svg>
          </Animated.View>

          {/* base label (ink on pill) */}
          <View
            style={styles.labelLayer}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            <Text selectable={false} style={[m.type.button, styles.noSelect, {color: colors.ink}]}>
              {label}
            </Text>
          </View>

          {/* inverted label, clipped to the fill so letters flip as it passes */}
          <Animated.View
            style={[styles.labelLayer, styles.clip, clipStyle]}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            <View style={[styles.labelLayer, {width}]}>
              <Text
                selectable={false}
                style={[m.type.button, styles.noSelect, {color: colors.paper}]}>
                {label}
              </Text>
            </View>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// RN Web maps userSelect/touchAction to the matching CSS properties. The
// -webkit-touch-callout rule in public/index.html handles iOS Safari's long-
// press callout, which has no RN style equivalent.
const noSelect = {
  userSelect: 'none',
  touchAction: 'none',
} as any;

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.pill,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  noSelect,
  halo: {
    position: 'absolute',
    left: -38,
    right: -38,
    top: -34,
    bottom: -34,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.ink,
  },
  edge: {
    position: 'absolute',
    left: -14,
    top: 0,
    bottom: 0,
    width: 28,
  },
  labelLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clip: {left: 0, right: undefined, overflow: 'hidden'},
});
