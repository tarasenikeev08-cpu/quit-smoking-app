import React, {useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import Companion from '@/components/Companion';
import Icon from '@/components/Icon';
import HoldButton from '@/components/HoldButton';
import {Stat} from '@/components/ui';
import {colors, controls, gutter, spacing, type as T} from '@/theme';
import {useStore} from '@/store';
import {useStreakDays, useRank, useSavings, useHeldToday} from '@/store/selectors';
import {haptic} from '@/lib/platform';

/**
 * HOME — built to Ember_Spec_Sheet.md (390x844).
 *
 * header 44 · flexible spacer (40%) · companion 150x165 · gap 12 ·
 * day-count group · flexible spacer (60%) · stat row (64) · gap 16 ·
 * hold bar (56) · gap 16 · tab bar.
 *
 * The two weighted spacers keep the companion generous up top and the action
 * block anchored low, with no single dead void.
 */
const COMPANION_SIZE = 150;
const COMPANION_BOX = 165;

export default function HomeScreen() {
  const streak = useStreakDays();
  const {current} = useRank();
  const {saved, avoided, habit} = useSavings();
  const equipped = useStore(s => s.equipped);
  const markHeld = useStore(s => s.markHeld);
  const heldToday = useHeldToday();

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
        {/* 1. header row */}
        <View style={styles.header}>
          <Text style={styles.rank}>{current.name.toUpperCase()}</Text>
          <Icon name="box" size={controls.headerIcon} />
        </View>

        {/* 2. flexible top spacer — 40% of the slack */}
        <View style={styles.spacerTop} />

        {/* 3. companion — the visual anchor */}
        <View style={styles.companionBox}>
          <Animated.View style={{transform: [{scale}, {translateY: lift}]}}>
            <Companion id={equipped} size={COMPANION_SIZE} shadow />
          </Animated.View>
        </View>

        {/* 4 + 5. gap 12, then the day-count group */}
        <View style={styles.countGroup}>
          <View style={styles.countRow}>
            <Text style={styles.count}>{streak}</Text>
            <Flame size={22} layers={2} />
          </View>
          <Text style={styles.countLabel}>Days clean</Text>
        </View>

        {/* 6. flexible bottom spacer — 60% of the slack */}
        <View style={styles.spacerBottom} />

        {/* 7. stat row */}
        <View style={styles.statRow}>
          <Stat k="Saved" v={`${habit.currencySymbol}${saved}`} />
          <Stat k="Avoided" v={avoided} />
        </View>

        {/* 8 + 9. gap 16, then the hold bar */}
        <View style={styles.holdWrap}>
          <HoldButton onComplete={onHoldComplete} held={heldToday} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // 10. gap 16 to the tab bar
  wrap: {flex: 1, paddingHorizontal: gutter, paddingBottom: spacing.lg},

  header: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rank: {...T.label, color: colors.ink},

  spacerTop: {flex: 4},
  spacerBottom: {flex: 6},

  companionBox: {height: COMPANION_BOX, alignItems: 'center', justifyContent: 'center'},

  countGroup: {alignItems: 'center', marginTop: spacing.md},
  countRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  count: {...T.display, color: colors.ink},
  countLabel: {...T.label, color: colors.muted, marginTop: spacing.xs},

  statRow: {flexDirection: 'row', gap: spacing.md},
  holdWrap: {marginTop: spacing.lg},
});
