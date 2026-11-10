import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Stepper from '@/components/Stepper';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {HABITS, formatAmount, formatMoney, formatPrice, monthlySpend} from '@/lib/savings';
import type {OnboardingParamList} from '@/navigation/types';
import {OnboardingStep} from './flow';

type Field = 'amountPerDay' | 'pricePerPack' | 'unitsPerPack';
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * STEP 2 — AMOUNT A DAY, PRICE PER PACK, PACK SIZE. The live monthly figure
 * is the sub-line, so the effect of each input is visible as it changes.
 * frame: header 6.5 · companion 15 · headline 11 · sub 5 ·
 * gap 2 · three inputs 11 each, 1.5 between · [FLEX] · button 6.2 · bottom 3.5
 */
export default function AmountsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  const m = useMetrics();
  const T = m.type;
  const habit = useStore(s => s.habit);
  const updateHabit = useStore(s => s.updateHabit);
  const spec = HABITS[habit.type];

  const step = (key: Field, dir: 1 | -1) => {
    const range =
      key === 'amountPerDay' ? spec.amount : key === 'pricePerPack' ? spec.price : spec.perPack;
    // read the store directly so a held (auto-repeating) button never steps
    // from a stale value
    const current = useStore.getState().habit[key];
    updateHabit({[key]: current + dir * range.step});
  };

  const field = (
    label: string,
    key: Field,
    shown: string,
    spoken: string,
    range: {min: number; max: number},
    first = false,
  ) => (
    <View style={[styles.field, {height: m.h(0.11), marginTop: first ? 0 : m.h(0.015)}]}>
      <Text style={[T.label, styles.fieldLabel]}>{label}</Text>
      <Stepper
        heightFraction={0.07}
        value={shown}
        accessibilityLabel={spoken}
        onDecrement={() => step(key, -1)}
        onIncrement={() => step(key, 1)}
        canDecrement={habit[key] > range.min}
        canIncrement={habit[key] < range.max}
      />
    </View>
  );

  const verb = habit.type === 'vape' ? 'vape' : 'smoke';

  return (
    <OnboardingStep
      headline={`How much did you ${verb}?`}
      sub={
        <>
          About <Text style={styles.strong}>{formatMoney(habit, monthlySpend(habit))}</Text> a
          month.
        </>
      }
      cta="Continue"
      onNext={() => nav.navigate('QuitDate')}
    >
      <View style={{height: m.h(0.02)}} />
      {field(
        `${cap(spec.unit.many)} a day`,
        'amountPerDay',
        formatAmount(habit.amountPerDay),
        `${formatAmount(habit.amountPerDay)} ${spec.unit.many} a day`,
        spec.amount,
        true,
      )}
      {field(
        `Price per ${spec.pack.one}`,
        'pricePerPack',
        formatMoney(habit, habit.pricePerPack, true),
        `${formatPrice(habit, habit.pricePerPack)} per ${spec.pack.one}`,
        spec.price,
      )}
      {field(
        `${cap(spec.unit.many)} per ${spec.pack.one}`,
        'unitsPerPack',
        String(habit.unitsPerPack),
        `${habit.unitsPerPack} ${spec.unit.many} per ${spec.pack.one}`,
        spec.perPack,
      )}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  // label sits directly on its control; the band's slack goes above the pair
  field: {justifyContent: 'flex-end'},
  fieldLabel: {color: colors.muted, marginBottom: 8},
  strong: {color: colors.ink, fontWeight: '600'},
});
