import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Screen from '@/components/Screen';
import {Button} from '@/components/ui';
import {colors, radius} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {DEFAULT_HABIT} from '@/lib/savings';
import type {OnboardingParamList} from '@/navigation/types';

const APP_PRICE = 5;
const STEP = 10;

export default function MathsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  const setHabit = useStore(s => s.setHabit);
  const m = useMetrics();
  const T = m.type;
  const [spend, setSpend] = useState(DEFAULT_HABIT.monthlySpend);

  const times = Math.max(1, Math.round(spend / APP_PRICE));
  // widths for the comparison bars (cap the big bar so the small one stays visible)
  const bigW = '100%';
  const smallPct = Math.max(6, Math.min(40, (APP_PRICE / spend) * 100));

  const next = () => {
    setHabit(spend);
    nav.navigate('Paywall');
  };

  return (
    <Screen>
      <View style={[styles.wrap, {paddingHorizontal: m.gutter, paddingTop: m.band.header}]}>
        <Text style={[T.h2, styles.headline, {color: colors.ink}]}>
          You spend about{' '}
          <Text style={styles.underline}>${spend}</Text> a month on cigarettes.
        </Text>

        <View style={styles.stepper}>
          <Pressable
            style={[styles.stepBtn, {height: m.controls.chip.height * 1.4, width: m.controls.chip.height * 1.4, borderRadius: m.controls.chip.height * 0.7}]}
            onPress={() => setSpend(s => Math.max(STEP, s - STEP))}>
            <Text style={[T.h2, {color: colors.ink}]}>−</Text>
          </Pressable>
          <Text style={[T.body, {fontWeight: "500", color: colors.ink}]}>${spend}/mo</Text>
          <Pressable style={[styles.stepBtn, {height: m.controls.chip.height * 1.4, width: m.controls.chip.height * 1.4, borderRadius: m.controls.chip.height * 0.7}]} onPress={() => setSpend(s => s + STEP)}>
            <Text style={[T.h2, {color: colors.ink}]}>+</Text>
          </Pressable>
        </View>

        <Text style={[T.label, styles.cap, {color: colors.muted}]}>Cigarettes / mo</Text>
        <View style={[styles.barDark, {width: bigW}]}>
          <Text style={[T.body, {fontWeight: "500", color: colors.paper}]}>${spend}</Text>
        </View>

        <Text style={[T.label, styles.cap, {color: colors.muted}]}>This app / mo</Text>
        <View style={styles.row}>
          <View style={[styles.barAccent, {width: `${smallPct}%`}]} />
          <Text style={[T.body, {fontWeight: "500", color: colors.ink}]}>${APP_PRICE}</Text>
        </View>

        <Text style={[T.body, styles.footnote, {color: colors.ink}]}>
          Quitting pays for the app <Text style={styles.bold}>{times} times over</Text>.
        </Text>

        <View style={styles.spacer} />
        <Button label="Continue" onPress={next} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingBottom: 24},
  headline: {marginBottom: 24},
  underline: {borderBottomWidth: 2, borderColor: colors.ink},
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.cardSm,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 24,
  },
  stepBtn: {backgroundColor: colors.pill, alignItems: 'center', justifyContent: 'center'},
  cap: {marginBottom: 8},
  barDark: {
    height: 36,
    backgroundColor: colors.ink,
    borderRadius: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 12,
    marginBottom: 20,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 12},
  barAccent: {height: 36, backgroundColor: colors.accent, borderRadius: 8, minWidth: 14},
  footnote: {textAlign: 'center', marginTop: 24},
  bold: {fontWeight: '700'},
  // THE ONE FLEX GAP — Continue anchored to the bottom
  spacer: {flex: 1},
});
