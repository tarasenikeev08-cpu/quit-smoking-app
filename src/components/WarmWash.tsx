import React from 'react';
import {StyleSheet} from 'react-native';
import Svg, {Defs, LinearGradient, Rect, Stop} from 'react-native-svg';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import {useWake} from '@/anim/wake';

/**
 * The screen's own reaction to the hold.
 *
 * Dormant, a thin cool grey veil sits over everything — the whole screen
 * reads a little colder and dimmer. As the hold charges, warmth rises from
 * the hold bar at the bottom and washes up through the screen, and the veil
 * lifts. Both layers are non-interactive and sit behind the content.
 */
export default function WarmWash() {
  const {wake, celebrate} = useWake();

  /** Cool veil: strongest when fully dormant. */
  const coolStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wake.value, [0, 1], [0.22, 0], Extrapolation.CLAMP),
  }), [wake]);

  /** Warm glow rising from the bottom of the screen. */
  const warmStyle = useAnimatedStyle(() => {
    const w = wake.value;
    return {
      opacity: interpolate(w, [0, 1], [0, 0.62], Extrapolation.CLAMP) + celebrate.value * 0.28,
      transform: [
        // starts low and climbs as the warmth spreads upward
        {translateY: interpolate(w, [0, 1], [260, 0], Extrapolation.CLAMP)},
        {scaleY: interpolate(w, [0, 1], [0.55, 1], Extrapolation.CLAMP) + celebrate.value * 0.12},
      ],
    };
  }, [wake, celebrate]);

  return (
    <>
      <Animated.View style={[styles.fill, coolStyle]} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id="cool" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#7E8798" stopOpacity="0.55" />
              <Stop offset="1" stopColor="#7E8798" stopOpacity="0.2" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#cool)" />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.fill, styles.bottom, warmStyle]} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            {/* hot at the bar, fading out well before the top */}
            <LinearGradient id="warm" x1="0" y1="1" x2="0" y2="0">
              <Stop offset="0" stopColor="#F2A61E" stopOpacity="0.34" />
              <Stop offset="0.35" stopColor="#F6C945" stopOpacity="0.13" />
              <Stop offset="0.75" stopColor="#F6C945" stopOpacity="0.04" />
              <Stop offset="1" stopColor="#F6C945" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#warm)" />
        </Svg>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  fill: {position: 'absolute', left: 0, right: 0, top: 0, bottom: 0},
  bottom: {transformOrigin: 'bottom'},
});
