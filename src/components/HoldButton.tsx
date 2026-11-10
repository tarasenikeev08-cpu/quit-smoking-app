import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  AccessibilityActionEvent,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {Defs, LinearGradient, RadialGradient, Rect, Stop} from 'react-native-svg';
import Animated, {
  cancelAnimation,
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
  /** no hold has ever been logged — this one starts the journey */
  firstHold?: boolean;
};

/** Haptic ticks while charging — accelerating, so the press feels like it's winding up. */
const TICKS = [170, 380, 610, 810, 970, 1090];

const A11Y_ACTIONS = [{name: 'activate' as const}];

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
 *
 * Everything here animates with transforms only — no per-frame width changes —
 * so the sweep never triggers layout on either platform.
 */
export default function HoldButton({onComplete, companionName, firstHold = false}: Props) {
  const m = useMetrics();
  const {wake, charge, pressing, celebrate, awake, active, start, abandon, complete} = useWake();

  // Inner width of the bar (inside its border). The fill, the inverted label
  // and the burning edge are all positioned against this one measurement, so
  // the two label layers line up to the pixel.
  const [innerW, setInnerW] = useState(0);
  const w = useSharedValue(0);

  const done = useRef(awake);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // slow breathing halo — only runs while the bar is actually inviting a press
  const halo = useSharedValue(0);
  useEffect(() => {
    if (active && !awake) {
      halo.value = withRepeat(withTiming(1, {duration: 1900, easing: EASE_IN_OUT}), -1, true);
    } else {
      cancelAnimation(halo);
    }
    return () => cancelAnimation(halo);
  }, [halo, active, awake]);

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

  // If the screen loses focus mid-hold (a notification, a tab switch), treat
  // it as a release rather than letting the timer complete off-screen.
  useEffect(() => {
    if (!active && finishTimer.current) {
      clearTimers();
      abandon();
    }
  }, [active, clearTimers, abandon]);

  const onLabelLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const width = e.nativeEvent.layout.width;
      setInnerW(width);
      w.value = width;
    },
    [w],
  );

  const finish = useCallback(() => {
    done.current = true;
    clearTimers();
    complete();
    haptic('success');
    onComplete();
  }, [clearTimers, complete, onComplete]);

  const pressIn = () => {
    if (done.current) return;
    clearTimers();
    start();
    haptic('light');
    // accelerating ticks as the charge builds
    tickTimers.current = TICKS.map(at => setTimeout(() => haptic('tick'), at));
    finishTimer.current = setTimeout(finish, HOLD_DURATION);
  };

  const pressOut = () => {
    if (done.current) return;
    clearTimers();
    abandon();
  };

  // Screen readers activate with a double-tap, which is a press, not a hold —
  // so a VoiceOver/TalkBack user could never complete it. Give them a direct
  // action that runs the same completion.
  const onAccessibilityAction = (e: AccessibilityActionEvent) => {
    if (e.nativeEvent.actionName !== 'activate' || done.current) return;
    clearTimers();
    finish();
  };

  const label = awake
    ? `${companionName} is awake`
    : firstHold
      ? 'Hold to begin'
      : `Hold to wake ${companionName}`;

  /** Warm halo behind the bar — only while dormant and not being pressed. */
  const haloStyle = useAnimatedStyle(() => {
    const inviting = (1 - wake.value) * (1 - pressing.value);
    return {
      opacity: inviting * interpolate(halo.value, [0, 1], [0.45, 0.85]),
      transform: [{scale: interpolate(halo.value, [0, 1], [0.94, 1.04])}],
    };
  }, [wake, pressing, halo]);

  /** The bar presses in, then springs with the celebration. */
  const barStyle = useAnimatedStyle(() => ({
    transform: [{scale: 1 - pressing.value * 0.02 + celebrate.value * 0.035}],
  }), [pressing, celebrate]);

  /**
   * Ink fill: a full-width slab slid in from the left (the track clips it),
   * rather than a width animated every frame.
   */
  const fillStyle = useAnimatedStyle(() => ({
    opacity: w.value > 0 ? 1 : 0,
    transform: [{translateX: (charge.value - 1) * w.value}],
  }), [w, charge]);

  /** A hot edge burning along the fill boundary while charging. */
  const edgeStyle = useAnimatedStyle(() => {
    const c = charge.value;
    const live = pressing.value * (c > 0.002 && c < 0.999 ? 1 : 0);
    return {
      opacity: live * interpolate(halo.value, [0, 1], [0.8, 1]),
      transform: [{translateX: c * w.value}],
    };
  }, [charge, pressing, halo, w]);

  /**
   * Inverted label: a window that slides in with the fill, holding a copy of
   * the label slid the opposite way — so the text stays put while the window
   * reveals it. Two transforms, no clipping width animated per frame.
   */
  const windowStyle = useAnimatedStyle(() => ({
    transform: [{translateX: (charge.value - 1) * w.value}],
  }), [charge, w]);
  const windowTextStyle = useAnimatedStyle(() => ({
    transform: [{translateX: (1 - charge.value) * w.value}],
  }), [charge, w]);

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
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityHint={
            awake ? undefined : firstHold ? 'Starts day one' : 'Logs today as a clean day'
          }
          accessibilityState={{disabled: awake}}
          accessibilityActions={A11Y_ACTIONS}
          onAccessibilityAction={onAccessibilityAction}
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

          {/* base label (ink on pill) — also the width measurement */}
          <View
            style={styles.labelLayer}
            onLayout={onLabelLayout}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            <Text selectable={false} style={[m.type.button, styles.noSelect, {color: colors.ink}]}>
              {label}
            </Text>
          </View>

          {/* inverted label (paper on ink), revealed by the sliding window */}
          <Animated.View
            style={[styles.window, {width: innerW}, windowStyle]}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants">
            <Animated.View style={[styles.labelLayer, {width: innerW}, windowTextStyle]}>
              <Text
                selectable={false}
                style={[m.type.button, styles.noSelect, {color: colors.paper}]}>
                {label}
              </Text>
            </Animated.View>
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
    right: 0,
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
  window: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});
