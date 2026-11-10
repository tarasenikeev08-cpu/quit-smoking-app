import React, {useEffect, useRef} from 'react';
import {Pressable, StyleSheet, Text, View, StyleProp, ViewStyle} from 'react-native';

import {colors, radius} from '@/theme';
import {useMetrics} from '@/theme/metrics';

const REPEAT_DELAY = 380;
const REPEAT_EVERY = 70;

/**
 * Tap to step once; press and hold to keep stepping. Uses a ref to the latest
 * handler, so a held button always steps from the current value.
 */
function useRepeat(step: () => void, disabled: boolean) {
  const fn = useRef(step);
  fn.current = step;
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const every = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeated = useRef(false);

  const stop = () => {
    if (delay.current) clearTimeout(delay.current);
    if (every.current) clearInterval(every.current);
    delay.current = every.current = null;
  };
  useEffect(() => stop, []);
  // hitting a limit mid-repeat ends the repeat
  useEffect(() => {
    if (disabled) stop();
  }, [disabled]);

  return {
    onPressIn: () => {
      repeated.current = false;
      stop();
      delay.current = setTimeout(() => {
        repeated.current = true;
        fn.current();
        every.current = setInterval(() => fn.current(), REPEAT_EVERY);
      }, REPEAT_DELAY);
    },
    onPressOut: stop,
    onPress: () => {
      if (!repeated.current) fn.current();
    },
  };
}

type Props = {
  value: string;
  /** spoken label for the value, e.g. "10 cigarettes a day" */
  accessibilityLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
  canDecrement?: boolean;
  canIncrement?: boolean;
  /** control height, as a fraction of screen height */
  heightFraction?: number;
  /** content between the buttons (defaults to the value text) */
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** − value + in a card: the input control for onboarding numbers and dates. */
export default function Stepper({
  value,
  accessibilityLabel,
  onDecrement,
  onIncrement,
  canDecrement = true,
  canIncrement = true,
  heightFraction = 0.07,
  children,
  style,
}: Props) {
  const m = useMetrics();
  const h = m.h(heightFraction);
  const btn = Math.round(Math.min(h * 0.74, m.h(0.055)));
  const dec = useRepeat(onDecrement, !canDecrement);
  const inc = useRepeat(onIncrement, !canIncrement);

  const button = (
    sign: '−' | '+',
    handlers: ReturnType<typeof useRepeat>,
    enabled: boolean,
    label: string,
  ) => (
    <Pressable
      {...handlers}
      disabled={!enabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{disabled: !enabled}}
      style={[
        styles.btn,
        {width: btn, height: btn, borderRadius: btn / 2},
        !enabled && styles.btnDisabled,
      ]}>
      <Text selectable={false} style={[m.type.h2, {color: colors.ink}]}>
        {sign}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={[styles.card, {height: h}, style]}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityActions={[{name: 'increment'}, {name: 'decrement'}]}
      onAccessibilityAction={e => {
        if (e.nativeEvent.actionName === 'increment' && canIncrement) onIncrement();
        if (e.nativeEvent.actionName === 'decrement' && canDecrement) onDecrement();
      }}>
      {button('−', dec, canDecrement, `Decrease ${accessibilityLabel}`)}
      <View style={styles.center}>
        {children ?? (
          <Text style={[m.type.body, styles.value, {color: colors.ink}]}>{value}</Text>
        )}
      </View>
      {button('+', inc, canIncrement, `Increase ${accessibilityLabel}`)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: 8,
  },
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  value: {fontWeight: '500'},
  btn: {
    backgroundColor: colors.pill,
    alignItems: 'center',
    justifyContent: 'center',
    // a held button must never select its own "−"/"+" glyph on web
    userSelect: 'none',
  } as any,
  btnDisabled: {opacity: 0.35},
});
