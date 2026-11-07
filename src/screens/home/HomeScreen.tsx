import React, {useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import Companion from '@/components/Companion';
import Icon from '@/components/Icon';
import HoldButton from '@/components/HoldButton';
import {Stat} from '@/components/ui';
import {colors, controls as fixed} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {useStreakDays, useRank, useSavings, useHeldToday} from '@/store/selectors';
import {haptic} from '@/lib/platform';

/**
 * HOME — built to Ember_Proportions.md. Every band is a percentage of screen
 * height, so the screen is proportionally identical on any iPhone:
 *
 *   header 6.5% · gap 4% · companion 30% · gap 1.5% · count group 12% ·
 *   [THE ONE FLEX GAP ~15%] · stat row 11% · gap 3% · hold bar 6.6% · gap 3%
 *
 * There is exactly ONE flexible gap, and it sits between the day count and the
 * stat row — never above the companion, never below the hold bar.
 */
export default function HomeScreen() {
  const streak = useStreakDays();
  const {current} = useRank();
  const {saved, avoided, habit} = useSavings();
  const equipped = useStore(s => s.equipped);
  const markHeld = useStore(s => s.markHeld);
  const heldToday = useHeldToday();
  const m = useMetrics();

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

  // flame sits at ~0.39x the day-count cap height, beside the number
  const flameSize = Math.round(m.type.dayCount.fontSize * 0.312);

  return (
    <Screen>
      <View style={[styles.wrap, {paddingHorizontal: m.gutter}]}>
        {/* header 6.5% */}
        <View style={[styles.header, {height: m.band.header}]}>
          <Text style={[m.type.label, {color: colors.ink}]}>
            {current.name.toUpperCase()}
          </Text>
          <Icon name="box" size={fixed.headerIcon} />
        </View>

        {/* gap 4% */}
        <View style={{height: m.band.gapAboveCompanion}} />

        {/* companion band 30% — the visual anchor */}
        <View style={[styles.centered, {height: m.band.companion}]}>
          <Animated.View style={{transform: [{scale}, {translateY: lift}]}}>
            <Companion id={equipped} size={m.companionSize} shadow />
          </Animated.View>
        </View>

        {/* gap 1.5% */}
        <View style={{height: m.band.gapBelowCompanion}} />

        {/* day count group 12% */}
        <View style={[styles.centered, {height: m.band.countGroup}]}>
          <View style={styles.countRow}>
            <Text style={[m.type.dayCount, {color: colors.ink}]}>{streak}</Text>
            <Flame size={flameSize} layers={2} />
          </View>
          <Text style={[m.type.label, {color: colors.muted, marginTop: 4}]}>Days clean</Text>
        </View>

        {/* ---- THE ONE FLEX GAP ---- */}
        <View style={styles.flexGap} />

        {/* stat row 11% */}
        <View style={[styles.statRow, {height: m.band.statRow, gap: m.statGap}]}>
          <Stat k="Saved" v={`${habit.currencySymbol}${saved}`} />
          <Stat k="Avoided" v={avoided} />
        </View>

        {/* gap 3% */}
        <View style={{height: m.band.gap}} />

        {/* hold bar 6.6% */}
        <HoldButton onComplete={onHoldComplete} held={heldToday} />

        {/* bottom gap 3% above the tab bar (fixed, not flexible) */}
        <View style={{height: m.band.gap}} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  centered: {alignItems: 'center', justifyContent: 'center'},
  countRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  flexGap: {flex: 1},
  statRow: {flexDirection: 'row'},
});
