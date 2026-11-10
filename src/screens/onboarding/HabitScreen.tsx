import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Screen from '@/components/Screen';
import Stepper from '@/components/Stepper';
import {Button, Pill} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {
  HABITS,
  HABIT_TYPES,
  formatAmount,
  formatMoney,
  monthlySpend,
} from '@/lib/savings';
import type {OnboardingParamList} from '@/navigation/types';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * ONBOARDING — WHAT YOU'RE QUITTING. Every number here feeds the live
 * savings and "avoided" figures; nothing downstream is a placeholder.
 *
 * top 6.5% · headline 10% · type 8% · gap 3% · amount 12% · gap 2% ·
 * price 12% · gap 2% · pack size 12% · summary 7% ·
 * [THE ONE FLEX GAP] · Continue 6.2% · bottom 3.5%
 */
export default function HabitScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  const m = useMetrics();
  const T = m.type;
  const habit = useStore(s => s.habit);
  const setHabitType = useStore(s => s.setHabitType);
  const updateHabit = useStore(s => s.updateHabit);
  const spec = HABITS[habit.type];

  const step = (key: 'amountPerDay' | 'pricePerPack' | 'unitsPerPack', dir: 1 | -1) => {
    const range =
      key === 'amountPerDay' ? spec.amount : key === 'pricePerPack' ? spec.price : spec.perPack;
    // read the store directly so a held (auto-repeating) button never steps
    // from a stale value
    const current = useStore.getState().habit[key];
    updateHabit({[key]: current + dir * range.step});
  };

  const row = (
    label: string,
    key: 'amountPerDay' | 'pricePerPack' | 'unitsPerPack',
    value: number,
    shown: string,
    spoken: string,
    range: {min: number; max: number},
  ) => (
    <View style={[styles.row, {height: m.h(0.12)}]}>
      <Text style={[T.label, styles.rowLabel, {color: colors.muted}]}>{label}</Text>
      <Stepper
        value={shown}
        accessibilityLabel={spoken}
        onDecrement={() => step(key, -1)}
        onIncrement={() => step(key, 1)}
        canDecrement={value > range.min}
        canIncrement={value < range.max}
      />
    </View>
  );

  const perMonth = formatMoney(habit, monthlySpend(habit));

  return (
    <Screen>
      <View style={[styles.wrap, {paddingHorizontal: m.gutter, paddingTop: m.band.header}]}>
        <View style={[styles.headlineBand, {height: m.h(0.1)}]}>
          <Text style={[T.h2, {color: colors.ink}]}>What are you quitting?</Text>
        </View>

        <View style={[styles.types, {height: m.h(0.08)}]}>
          {HABIT_TYPES.map(t => (
            <Pill
              key={t}
              label={HABITS[t].label}
              active={habit.type === t}
              onPress={() => setHabitType(t)}
            />
          ))}
        </View>

        <View style={{height: m.h(0.03)}} />

        {row(
          `${cap(spec.unit.many)} a day`,
          'amountPerDay',
          habit.amountPerDay,
          formatAmount(habit.amountPerDay),
          `${formatAmount(habit.amountPerDay)} ${spec.unit.many} a day`,
          spec.amount,
        )}
        <View style={{height: m.h(0.02)}} />
        {row(
          `Price per ${spec.pack.one}`,
          'pricePerPack',
          habit.pricePerPack,
          formatMoney(habit, habit.pricePerPack, true),
          `${formatMoney(habit, habit.pricePerPack, true)} per ${spec.pack.one}`,
          spec.price,
        )}
        <View style={{height: m.h(0.02)}} />
        {row(
          `${cap(spec.unit.many)} per ${spec.pack.one}`,
          'unitsPerPack',
          habit.unitsPerPack,
          String(habit.unitsPerPack),
          `${habit.unitsPerPack} ${spec.unit.many} per ${spec.pack.one}`,
          spec.perPack,
        )}

        <View style={[styles.summaryBand, {height: m.h(0.07)}]}>
          <Text style={[T.body, styles.summary, {color: colors.muted}]} accessibilityLiveRegion="polite">
            That’s about <Text style={styles.strong}>{perMonth}</Text> a month.
          </Text>
        </View>

        {/* ---- THE ONE FLEX GAP ---- */}
        <View style={styles.flexGap} />

        <Button label="Continue" onPress={() => nav.navigate('QuitDate')} />
        <View style={{height: m.h(0.035)}} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1},
  headlineBand: {justifyContent: 'center'},
  types: {flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'},
  // label sits directly on its control; the band's slack goes above the pair
  row: {justifyContent: 'flex-end'},
  rowLabel: {marginBottom: 6},
  summaryBand: {justifyContent: 'center'},
  summary: {textAlign: 'center'},
  strong: {color: colors.ink, fontWeight: '600'},
  flexGap: {flex: 1},
});
