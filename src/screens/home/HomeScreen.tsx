import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Screen from '@/components/Screen';
import LiveFlame from '@/components/LiveFlame';
import CompanionWake from '@/components/CompanionWake';
import Embers from '@/components/Embers';
import WarmWash from '@/components/WarmWash';
import Icon from '@/components/Icon';
import HoldButton from '@/components/HoldButton';
import {Stat} from '@/components/ui';
import {colors, controls as fixed} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {useStreakDays, useRank, useSavings, useHeldToday} from '@/store/selectors';
import {companionName} from '@/lib/companions';
import {SPRING_HOP, EASE_OUT} from '@/anim/config';
import {WakeProvider, useWakeEngine} from '@/anim/wake';

/**
 * HOME — built to Ember_Proportions.md. Every band is a percentage of screen
 * height, so the screen is proportionally identical on any iPhone:
 *
 *   header 6.5% · gap 4% · companion 30% · gap 1.5% · count group 12% ·
 *   [THE ONE FLEX GAP ~15%] · stat row 11% · gap 3% · hold bar 6.6% · gap 3%
 *
 * There is exactly ONE flexible gap, and it sits between the day count and the
 * stat row — never above the companion, never below the hold bar.
 *
 * The daily hold is the screen's one interaction: it drives a shared wake
 * engine (src/anim/wake.tsx) that every element reads from, so holding the bar
 * warms the background, revives the companion and lights the flame as one
 * continuous event.
 */
export default function HomeScreen() {
  const heldToday = useHeldToday();
  const engine = useWakeEngine(heldToday);

  return (
    <WakeProvider engine={engine}>
      <HomeContent />
    </WakeProvider>
  );
}

function HomeContent() {
  const streak = useStreakDays();
  const {current} = useRank();
  const {saved, avoided, habit} = useSavings();
  const equipped = useStore(s => s.equipped);
  const markHeld = useStore(s => s.markHeld);
  const m = useMetrics();

  // The streak number kicks with a spring overshoot the moment the hold lands,
  // riding the same beat as the companion's hop.
  const tick = useSharedValue(0);

  const onHoldComplete = () => {
    markHeld();
    tick.value = withSequence(
      withTiming(1, {duration: 140, easing: EASE_OUT}),
      withSpring(0, SPRING_HOP),
    );
  };

  const countStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: 1 + tick.value * 0.22},
      {translateY: -tick.value * 6},
    ],
  }));

  // flame sits at ~0.39x the day-count cap height, beside the number
  const flameSize = Math.round(m.type.dayCount.fontSize * 0.312);

  return (
    <Screen>
      {/* the screen's own reaction: cool when dormant, warm as it wakes */}
      <WarmWash />

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
          <CompanionWake id={equipped} size={m.companionSize} />
        </View>

        {/* gap 1.5% */}
        <View style={{height: m.band.gapBelowCompanion}} />

        {/* day count group 12% */}
        <View style={[styles.centered, {height: m.band.countGroup}]}>
          <Animated.View style={[styles.countRow, countStyle]}>
            <Text style={[m.type.dayCount, {color: colors.ink}]}>{streak}</Text>
            <View>
              <LiveFlame size={flameSize} />
              {/* sparks rise off the flame and burst from it on completion */}
              <Embers size={flameSize} spread={m.type.dayCount.fontSize * 2.6} />
            </View>
          </Animated.View>
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
        <HoldButton onComplete={onHoldComplete} companionName={companionName(equipped)} />

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
