import React, {useEffect, useRef, useState} from 'react';
import {AppState, Pressable, StyleSheet, Text, View} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
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
import {
  useStreakDays,
  useStreakStart,
  useRank,
  useSavings,
  useHeldToday,
} from '@/store/selectors';
import {formatMoney} from '@/lib/savings';
import {formatDay} from '@/lib/days';
import {companionName} from '@/lib/companions';
import {SPRING_HOP, EASE_OUT, ONBOARDING_HANDOFF_WAKE} from '@/anim/config';
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
/** Focused AND foregrounded — the only time Home's idle animation should run. */
function useScreenActive(): boolean {
  const focused = useIsFocused();
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => setForeground(s === 'active'));
    return () => sub.remove();
  }, []);
  return focused && foreground;
}

export default function HomeScreen() {
  const heldToday = useHeldToday();
  const active = useScreenActive();
  // Just out of onboarding: the companion stays as awake as onboarding left
  // it (not back to sleep) until the user's first hold wakes it fully.
  const arrived = useStore(s => s.arrivedFromOnboarding);
  const engine = useWakeEngine(heldToday, active, arrived ? ONBOARDING_HANDOFF_WAKE : 0);

  return (
    <WakeProvider engine={engine}>
      <HomeContent />
    </WakeProvider>
  );
}

function HomeContent() {
  const streak = useStreakDays();
  const {current} = useRank();
  const {saved, avoided, habit, spec} = useSavings();
  const streakStart = useStreakStart();
  const today = useStore(s => s.today);
  const equipped = useStore(s => s.equipped);
  const markHeld = useStore(s => s.markHeld);
  const clearArrival = useStore(s => s.clearArrival);
  const firstHold = useStore(s => s.lastHeldAt === null);
  const nav = useNavigation<any>();
  const m = useMetrics();

  // The streak number kicks with a spring overshoot the moment the hold lands,
  // riding the same beat as the companion's hop.
  const tick = useSharedValue(0);
  const kickCount = () => {
    tick.value = withSequence(
      withTiming(1, {duration: 140, easing: EASE_OUT}),
      withSpring(0, SPRING_HOP),
    );
  };

  const onHoldComplete = () => {
    markHeld();
    kickCount();
    clearArrival();
  };

  /*
   * Arrival from onboarding: the screen fades in with the companion exactly
   * as awake as onboarding left it, and the hold bar reads "Hold to begin".
   * Nothing is logged for the user — the first hold is theirs, and it plays
   * the full wake: hop, flame flare, ember burst, count kick.
   */
  const intro = useRef(useStore.getState().arrivedFromOnboarding).current;
  const screenIn = useSharedValue(intro ? 0 : 1);
  useEffect(() => {
    if (intro) screenIn.value = withTiming(1, {duration: 480, easing: EASE_OUT});
    // once, for the mount that follows onboarding
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const screenInStyle = useAnimatedStyle(() => ({opacity: screenIn.value}), [screenIn]);

  const countStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: 1 + tick.value * 0.22},
      {translateY: -tick.value * 6},
    ],
  }), [tick]);

  // flame sits at ~0.39x the day-count cap height, beside the number
  const flameSize = Math.round(m.type.dayCount.fontSize * 0.312);

  return (
    <Animated.View style={[styles.fill, screenInStyle]}>
      <Screen>
      {/* the screen's own reaction: cool when dormant, warm as it wakes */}
      <WarmWash />

      <View style={[styles.wrap, {paddingHorizontal: m.gutter}]}>
        {/* header 6.5% */}
        <View style={[styles.header, {height: m.band.header}]}>
          <Text style={[m.type.label, {color: colors.ink}]}>
            {current.name.toUpperCase()}
          </Text>
          <View style={styles.headerIcons}>
            <Pressable
              onPress={() => nav.navigate('Settings')}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Settings">
              <Icon name="settings" size={fixed.headerIcon} />
            </Pressable>
            {/* the box was decorative but read as a button — make it one */}
            <Pressable
              onPress={() => nav.navigate('Collection')}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Open collection">
              <Icon name="box" size={fixed.headerIcon} />
            </Pressable>
          </View>
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
          {/* the count runs from the user's real quit date (or last restart) */}
          <Text style={[m.type.label, styles.countLabel]}>
            {streakStart >= today ? 'Day one · starting today' : `Days clean · since ${formatDay(streakStart, today)}`}
          </Text>
        </View>

        {/* ---- THE ONE FLEX GAP ---- */}
        <View style={styles.flexGap} />

        {/* stat row 11% */}
        <View style={[styles.statRow, {height: m.band.statRow, gap: m.statGap}]}>
          <Stat k="Saved" v={formatMoney(habit, saved)} />
          <Stat
            k="Avoided"
            v={
              <Text style={[m.type.statValue, {color: colors.ink}]}>
                {avoided.toLocaleString('en-US')}
                <Text style={[m.type.caption, {color: colors.muted}]}> {spec.unit.short}</Text>
              </Text>
            }
          />
        </View>

        {/* gap 3% */}
        <View style={{height: m.band.gap}} />

        {/* hold bar 6.6% */}
        <HoldButton
          onComplete={onHoldComplete}
          companionName={companionName(equipped)}
          firstHold={firstHold}
        />

        {/* bottom gap 3% above the tab bar (fixed, not flexible) */}
        <View style={{height: m.band.gap}} />
      </View>
      </Screen>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  wrap: {flex: 1},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  headerIcons: {flexDirection: 'row', alignItems: 'center', gap: 20},
  centered: {alignItems: 'center', justifyContent: 'center'},
  countRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  countLabel: {color: colors.muted, marginTop: 4},
  flexGap: {flex: 1},
  statRow: {flexDirection: 'row'},
});
