import React, {useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Circle, Ellipse, Path} from 'react-native-svg';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Extrapolation,
} from 'react-native-reanimated';

import Companion, {CompanionId, faceGeom} from '@/components/Companion';
import {colors} from '@/theme';
import {BREATH_PERIOD, EASE_IN_OUT} from '@/anim/config';
import {useWake} from '@/anim/wake';

/**
 * The companion, alive.
 *
 * Dormant it is grey, eyes shut, breathing slowly with a "z" drifting off.
 * The hold revives it: colour returns, the outline darkens to ink, the eyes
 * open, it lifts and smiles — every step tied to wake progress (0..1), so
 * letting go halfway leaves it half-woken and it settles back down.
 *
 * Everything animates via opacity and transforms only: the dim and bright
 * drawings are stacked and cross-faded rather than restyled, so the whole
 * thing stays on the compositor and the reference artwork is never redrawn.
 */
export default function CompanionWake({id, size}: {id: CompanionId; size: number}) {
  const {wake, celebrate} = useWake();
  const face = useMemo(() => faceGeom(id, size), [id, size]);

  // Two independent loops: the slow dormant breath, and a faster awake idle.
  const breath = useSharedValue(0);
  const zDrift = useSharedValue(0);
  React.useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, {duration: BREATH_PERIOD, easing: EASE_IN_OUT}),
      -1,
      true,
    );
    zDrift.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 2400, easing: EASE_IN_OUT}),
        withTiming(1, {duration: 500}),
      ),
      -1,
      false,
    );
  }, [breath, zDrift]);

  /** Breath amplitude fades as it wakes: deep sleep -> alert stillness. */
  const body = useAnimatedStyle(() => {
    const w = wake.value;
    const sleepAmp = 1 - w; // dormant breathing is the deepest
    const breathScale = 1 + breath.value * (0.035 * sleepAmp + 0.008);
    const breathY = breath.value * (5 * sleepAmp + 1.2);

    // wakes up by lifting and growing slightly, then hops on completion
    const lift = interpolate(w, [0, 1], [6, -10], Extrapolation.CLAMP);
    const grow = interpolate(w, [0, 1], [0.94, 1], Extrapolation.CLAMP);
    const hop = celebrate.value;

    return {
      transform: [
        {translateY: breathY + lift - hop * 26},
        {scale: breathScale * grow * (1 + hop * 0.1)},
      ],
    };
  });

  /** Dim drawing on top when asleep. */
  const dimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wake.value, [0, 0.85], [1, 0], Extrapolation.CLAMP),
  }));

  /** Bright drawing fades in underneath it. */
  const brightStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wake.value, [0.05, 0.75], [0, 1], Extrapolation.CLAMP),
  }));

  /** Sleepy eye arcs: shut until half-woken, then the eyes snap open. */
  const shutStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wake.value, [0.3, 0.62], [1, 0], Extrapolation.CLAMP),
  }));
  const openStyle = useAnimatedStyle(() => ({
    opacity: interpolate(wake.value, [0.45, 0.7], [0, 1], Extrapolation.CLAMP),
  }));

  /** The smile grows with the last third of the hold, and widens on the hop. */
  const smileStyle = useAnimatedStyle(() => {
    const grow = interpolate(wake.value, [0.55, 1], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: grow,
      transform: [{scaleX: 0.5 + grow * 0.5 + celebrate.value * 0.18}, {scaleY: grow}],
    };
  });

  /**
   * Contact shadow. It stays on the ground rather than travelling with the
   * body, and tightens and darkens slightly as the companion lifts off it.
   */
  const shadowStyle = useAnimatedStyle(() => {
    const w = wake.value;
    const lifted = w + celebrate.value;
    return {
      opacity: interpolate(lifted, [0, 1, 2], [0.5, 0.85, 0.5], Extrapolation.CLAMP),
      transform: [
        {scaleX: interpolate(lifted, [0, 1, 2], [1, 0.82, 0.6], Extrapolation.CLAMP)},
        {scaleY: interpolate(lifted, [0, 1, 2], [1, 0.8, 0.55], Extrapolation.CLAMP)},
      ],
    };
  });

  /** A faint "z" drifting up and fading — only while genuinely asleep. */
  const zStyle = useAnimatedStyle(() => {
    const asleep = interpolate(wake.value, [0, 0.35], [1, 0], Extrapolation.CLAMP);
    const t = zDrift.value;
    return {
      opacity: asleep * interpolate(t, [0, 0.15, 0.7, 1], [0, 0.5, 0.32, 0], Extrapolation.CLAMP),
      transform: [
        {translateY: -t * size * 0.3},
        {translateX: t * size * 0.08},
        {scale: 0.7 + t * 0.5},
      ],
    };
  });

  const zSize = Math.max(11, Math.round(size * 0.1));

  return (
    <View style={{width: size, height: size}}>
      {/* contact shadow — grounded, so the lift actually reads as a lift */}
      <Animated.View style={[styles.layer, shadowStyle]} pointerEvents="none">
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Ellipse cx="50" cy="74" rx="21" ry="2.8" fill="#000" opacity={0.09} />
        </Svg>
      </Animated.View>

      <Animated.View style={[styles.layer, body]}>
        {/* bright (awake) drawing — underneath */}
        <Animated.View style={[styles.layer, brightStyle]}>
          <Companion id={id} size={size} face={false} />
        </Animated.View>

        {/* dim (dormant) drawing — on top, fades away as it wakes */}
        <Animated.View style={[styles.layer, dimStyle]}>
          <Companion id={id} size={size} face={false} locked />
        </Animated.View>

        {face && (
          <>
            {/* eyes shut: sleepy downward arcs */}
            <Animated.View style={[styles.layer, shutStyle]} pointerEvents="none">
              <Svg width={size} height={size} viewBox={`0 0 ${face.viewBox} ${face.viewBox}`}>
                {face.eyes.map((e, i) => (
                  <Path
                    key={i}
                    d={`M${e.cx - e.r * 1.5} ${e.cy} Q${e.cx} ${e.cy + e.r * 1.9} ${
                      e.cx + e.r * 1.5
                    } ${e.cy}`}
                    fill="none"
                    stroke={colors.muted}
                    strokeWidth={e.r * 0.85}
                    strokeLinecap="round"
                  />
                ))}
              </Svg>
            </Animated.View>

            {/* eyes open */}
            <Animated.View style={[styles.layer, openStyle]} pointerEvents="none">
              <Svg width={size} height={size} viewBox={`0 0 ${face.viewBox} ${face.viewBox}`}>
                {face.eyes.map((e, i) => (
                  <Circle key={i} cx={e.cx} cy={e.cy} r={e.r} fill={colors.ink} />
                ))}
              </Svg>
            </Animated.View>

            {/* the smile */}
            {face.mouth && (
              <Animated.View style={[styles.layer, smileStyle]} pointerEvents="none">
                <Svg width={size} height={size} viewBox={`0 0 ${face.viewBox} ${face.viewBox}`}>
                  <Path
                    d={`M${face.mouth.cx - face.mouth.w / 2} ${face.mouth.cy} Q${
                      face.mouth.cx
                    } ${face.mouth.cy + face.mouth.depth} ${face.mouth.cx + face.mouth.w / 2} ${
                      face.mouth.cy
                    }`}
                    fill="none"
                    stroke={colors.ink}
                    strokeWidth={face.viewBox > 100 ? 2.2 : 1.4}
                    strokeLinecap="round"
                  />
                </Svg>
              </Animated.View>
            )}
          </>
        )}
      </Animated.View>

      {/* sleeping "z", drifting up off the shoulder */}
      <Animated.View
        style={[styles.z, {right: size * 0.1, top: size * 0.12}, zStyle]}
        pointerEvents="none">
        <Svg width={zSize} height={zSize} viewBox="0 0 12 12">
          <Path
            d="M3 3 H9 L3 9 H9"
            fill="none"
            stroke={colors.muted}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  z: {position: 'absolute'},
});
