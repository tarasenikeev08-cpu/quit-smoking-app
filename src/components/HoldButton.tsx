import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Easing, LayoutChangeEvent, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius} from '@/theme';

export const HOLD_DURATION = 1200;

type Props = {
  /** fired once the hold completes */
  onComplete: () => void;
  /** already completed today — render the resting, filled state */
  held?: boolean;
  idleLabel?: string;
  heldLabel?: string;
};

/**
 * Press-and-hold to confirm. The ink fill sweeps left→right over ~1.2s; the
 * label inverts as the fill passes under it (a paper-coloured copy of the label
 * is revealed by a clip that tracks the fill). Releasing early springs the fill
 * back and logs nothing.
 */
export default function HoldButton({
  onComplete,
  held = false,
  idleLabel = 'Hold — still clean',
  heldLabel = 'Still clean',
}: Props) {
  const progress = useRef(new Animated.Value(held ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [width, setWidth] = useState(0);
  const done = useRef(held);

  useEffect(() => {
    done.current = held;
    progress.setValue(held ? 1 : 0);
  }, [held, progress]);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const pressIn = () => {
    if (done.current) return;
    Animated.spring(scale, {toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 0}).start();
    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({finished}) => {
      if (!finished) return;
      done.current = true;
      Animated.spring(scale, {toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10}).start();
      onComplete();
    });
  };

  const pressOut = () => {
    if (done.current) return;
    Animated.spring(scale, {toValue: 1, useNativeDriver: true, speed: 40, bounciness: 0}).start();
    // released early — snap back, nothing logged
    Animated.timing(progress, {
      toValue: 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  const label = done.current || held ? heldLabel : idleLabel;
  const fillWidth = progress.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']});

  return (
    <Animated.View style={{transform: [{scale}]}}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onLayout={onLayout}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.track}>
        {/* ink fill sweeping left -> right */}
        <Animated.View style={[styles.fill, {width: fillWidth}]} />

        {/* base label (ink on pill) */}
        <View
          style={styles.labelLayer}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <Text style={[styles.label, {color: colors.ink}]}>{label}</Text>
        </View>

        {/* inverted label, clipped to the fill so letters flip as it passes */}
        <Animated.View
          style={[styles.labelLayer, styles.clip, {width: fillWidth}]}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <View style={[styles.labelLayer, {width}]}>
            <Text style={[styles.label, {color: colors.paper}]}>{label}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.pill,
    borderWidth: 1.5,
    borderColor: colors.ink,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.ink,
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
  label: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
