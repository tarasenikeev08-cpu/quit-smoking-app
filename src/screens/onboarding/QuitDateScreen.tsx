import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import dayjs from 'dayjs';

import Screen from '@/components/Screen';
import Stepper from '@/components/Stepper';
import {Button, Pill} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore, MAX_QUIT_DAYS_AGO} from '@/store';
import {addDays, dayDiff, relativeDay} from '@/lib/days';
import type {OnboardingParamList} from '@/navigation/types';

const PRESETS: {label: string; daysAgo: number}[] = [
  {label: 'Today', daysAgo: 0},
  {label: 'Yesterday', daysAgo: 1},
  {label: '1 week', daysAgo: 7},
  {label: '1 month', daysAgo: 30},
];

/**
 * ONBOARDING — QUIT DATE. The streak, lifetime days and savings all count
 * from the day chosen here.
 *
 * top 6.5% · headline 12% · gap 4% · date 28% · gap 4% · presets 6% ·
 * gap 3% · note 9% · [THE ONE FLEX GAP] · Continue 6.2% · bottom 3.5%
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

  const next = () => {
    setQuitDate(day); // commit "today" explicitly if nothing was picked
    nav.navigate('Maths');
  };

  return (
    <Screen>
      <View style={[styles.wrap, {paddingHorizontal: m.gutter, paddingTop: m.band.header}]}>
        <View style={[styles.headlineBand, {height: m.h(0.12)}]}>
          <Text style={[T.h2, {color: colors.ink}]}>When did you quit?</Text>
          <Text style={[T.body, {color: colors.muted, marginTop: 6}]}>
            Your streak and savings count from this day.
          </Text>
        </View>

        <View style={{height: m.h(0.04)}} />

        <Stepper
          heightFraction={0.28}
          value={big}
          accessibilityLabel={`Quit date ${dayjs(day).format('dddd D MMMM YYYY')}, ${relativeDay(day, today)}`}
          onDecrement={() => shift(-1)}
          onIncrement={() => shift(1)}
          canDecrement={ago < MAX_QUIT_DAYS_AGO}
          canIncrement={ago > 0}>
          <Text style={[T.h1, {color: colors.ink}]}>{big}</Text>
          <Text style={[T.caption, {color: colors.muted, marginTop: 6}]}>
            {relativeDay(day, today)}
            {yearNote}
          </Text>
        </Stepper>

        <View style={{height: m.h(0.04)}} />

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

        <View style={{height: m.h(0.03)}} />

        <View style={[styles.noteBand, {height: m.h(0.09)}]}>
          <Text style={[T.caption, styles.note, {color: colors.muted}]}>
            Not quit yet? Choose today — your first clean day starts now.
          </Text>
        </View>

        {/* ---- THE ONE FLEX GAP ---- */}
        <View style={styles.flexGap} />

        <Button label="Continue" onPress={next} />
        <View style={{height: m.h(0.035)}} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1},
  headlineBand: {justifyContent: 'center'},
  presets: {flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'},
  noteBand: {justifyContent: 'flex-start'},
  note: {textAlign: 'center', paddingHorizontal: 12},
  flexGap: {flex: 1},
});
