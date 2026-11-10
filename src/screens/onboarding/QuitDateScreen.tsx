import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import dayjs from 'dayjs';

import Stepper from '@/components/Stepper';
import {Pill} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore, MAX_QUIT_DAYS_AGO} from '@/store';
import {addDays, dayDiff, relativeDay} from '@/lib/days';
import type {OnboardingParamList} from '@/navigation/types';
import {OnboardingStep} from './flow';

const PRESETS: {label: string; daysAgo: number}[] = [
  {label: 'Today', daysAgo: 0},
  {label: 'Yesterday', daysAgo: 1},
  {label: '1 week', daysAgo: 7},
  {label: '1 month', daysAgo: 30},
];

/**
 * STEP 3 — QUIT DATE. The streak, lifetime days and savings count from here.
 * frame: header 6.5 · companion 15 · headline 11 · sub 5 ·
 * gap 3 · date 16 · gap 3 · presets 6 · gap 2 · note 5 · [FLEX] · button 6.2 · bottom 3.5
 */
export default function QuitDateScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  const m = useMetrics();
  const T = m.type;
  const today = useStore(s => s.today);
  const chosen = useStore(s => s.quitDate);
  const setQuitDate = useStore(s => s.setQuitDate);

  // nothing chosen yet (or a stale future date) reads as today
  const day = chosen && chosen <= today ? chosen : today;
  const ago = dayDiff(day, today);

  // step from the stored value so a held button never works from a stale one
  const shift = (n: number) => {
    const s = useStore.getState();
    const cur = s.quitDate && s.quitDate <= s.today ? s.quitDate : s.today;
    setQuitDate(addDays(cur, n));
  };

  const big = dayjs(day).format('ddd D MMM');
  const yearNote = day.slice(0, 4) !== today.slice(0, 4) ? ` · ${day.slice(0, 4)}` : '';

  return (
    <OnboardingStep
      headline="When did you quit?"
      sub="Your count starts here."
      cta="Continue"
      onNext={() => {
        setQuitDate(day); // commit "today" explicitly if nothing was picked
        nav.navigate('Savings');
      }}
    >
      <View style={{height: m.h(0.03)}} />
      <Stepper
        heightFraction={0.16}
        value={big}
        accessibilityLabel={`Quit date ${dayjs(day).format('dddd D MMMM YYYY')}, ${relativeDay(
          day,
          today,
        )}`}
        onDecrement={() => shift(-1)}
        onIncrement={() => shift(1)}
        canDecrement={ago < MAX_QUIT_DAYS_AGO}
        canIncrement={ago > 0}
      >
        <Text style={[T.h1, {color: colors.ink}]}>{big}</Text>
        <Text style={[T.caption, styles.relative]}>
          {relativeDay(day, today)}
          {yearNote}
        </Text>
      </Stepper>

      <View style={{height: m.h(0.03)}} />
      <View style={[styles.presets, {height: m.h(0.06)}]}>
        {PRESETS.map(p => (
          <Pill
            key={p.label}
            label={p.label}
            active={ago === p.daysAgo}
            onPress={() => setQuitDate(addDays(today, -p.daysAgo))}
          />
        ))}
      </View>

      <View style={{height: m.h(0.02)}} />
      <View style={[styles.noteBand, {height: m.h(0.05)}]}>
        <Text style={[T.caption, styles.note]}>Not yet? Pick today.</Text>
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  relative: {color: colors.muted, marginTop: 6},
  presets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  noteBand: {justifyContent: 'center'},
  note: {color: colors.muted},
});
