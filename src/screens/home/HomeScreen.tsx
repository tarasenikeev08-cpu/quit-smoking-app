import React, {useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View, useWindowDimensions} from 'react-native';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import Companion from '@/components/Companion';
import Icon from '@/components/Icon';
import HoldButton from '@/components/HoldButton';
import {Stat} from '@/components/ui';
import {colors, spacing} from '@/theme';
import {useStore} from '@/store';
import {useStreakDays, useRank, useSavings, useHeldToday} from '@/store/selectors';
import {haptic} from '@/lib/platform';

/**
 * Vertical rhythm follows design/reference.html (300x494 frame): header at the
 * top, the companion + day count as the dominant centred group (~38% of the
 * content box), then stats and the hold button anchored above the tab bar. The
 * centred group absorbs the extra height of a real phone screen, so nothing
 * floats at the top.
 */
export default function HomeScreen() {
  const streak = useStreakDays();
  const {current} = useRank();
  const {saved, avoided, habit} = useSavings();
  const equipped = useStore(s => s.equipped);
  const markHeld = useStore(s => s.markHeld);
  const heldToday = useHeldToday();
  const {width} = useWindowDimensions();

  // reference: companion is 150 wide in a 300 frame — half the screen width
  const companionSize = Math.min(width * 0.5, 200);

  const react = useRef(new Animated.Value(0)).current;
  const onHoldComplete = () => {
    markHeld();
    haptic('success');
    Animated.sequence([
      Animated.timing(react, {
        toValue: 1,
        duration: 170,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(react, {toValue: 0, useNativeDriver: true, speed: 12, bounciness: 14}),
    ]).start();
  };

  const scale = react.interpolate({inputRange: [0, 1], outputRange: [1, 1.12]});
  const lift = react.interpolate({inputRange: [0, 1], outputRange: [0, -12]});

  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.topRow}>
          <Text style={styles.rank}>{current.name.toUpperCase()}</Text>
          <Icon name="box" size={19} />
        </View>

        {/* dominant centred group — companion + day count */}
        <View style={styles.heroGroup}>
          <View style={styles.spacerTop} />
          <Animated.View style={{transform: [{scale}, {translateY: lift}]}}>
            <Companion id={equipped} size={companionSize} shadow />
          </Animated.View>
          <View style={styles.countWrap}>
            <View style={styles.countRow}>
              <Text style={styles.count}>{streak}</Text>
              <Flame size={22} layers={2} />
            </View>
            <Text style={styles.countLabel}>days clean</Text>
          </View>
          <View style={styles.spacerBottom} />
        </View>

        <View style={styles.stats}>
          <Stat k="Saved" v={`${habit.currencySymbol}${saved}`} />
          <Stat k="Avoided" v={avoided} />
        </View>

        <View style={styles.hold}>
          <HoldButton onComplete={onHoldComplete} held={heldToday} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingHorizontal: spacing.lg, paddingBottom: 8},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  rank: {fontSize: 12, fontWeight: '500', letterSpacing: 1.5, color: colors.ink},

  // The reference frame (h/w 1.65) is shorter than a real phone (~2.16), so the
  // slack is split 60/40 above the companion and below the count — the hero
  // breathes without the action block drifting away from the count.
  heroGroup: {flex: 1, alignItems: 'center'},
  spacerTop: {flex: 1.5},
  spacerBottom: {flex: 1},
  countWrap: {alignItems: 'center', marginTop: 10},
  countRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  count: {fontSize: 44, fontWeight: '500', lineHeight: 46, color: colors.ink},
  countLabel: {
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  stats: {flexDirection: 'row', gap: 10, marginTop: 18},
  hold: {marginTop: 16},
});
