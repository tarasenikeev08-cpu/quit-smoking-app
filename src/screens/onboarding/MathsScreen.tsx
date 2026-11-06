import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Screen from '@/components/Screen';
import {Button} from '@/components/ui';
import {colors, gutter, radius, spacing, type as T} from '@/theme';
import {useStore} from '@/store';
import {DEFAULT_HABIT} from '@/lib/savings';
import type {OnboardingParamList} from '@/navigation/types';

const APP_PRICE = 5;
const STEP = 10;

export default function MathsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  const setHabit = useStore(s => s.setHabit);
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
      <View style={styles.wrap}>
        <Text style={styles.headline}>
          You spend about{' '}
          <Text style={styles.underline}>${spend}</Text> a month on cigarettes.
        </Text>

        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() => setSpend(s => Math.max(STEP, s - STEP))}>
            <Text style={styles.stepTxt}>−</Text>
          </Pressable>
          <Text style={styles.stepVal}>${spend}/mo</Text>
          <Pressable style={styles.stepBtn} onPress={() => setSpend(s => s + STEP)}>
            <Text style={styles.stepTxt}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.cap}>Cigarettes / mo</Text>
        <View style={[styles.barDark, {width: bigW}]}>
          <Text style={styles.barDarkTxt}>${spend}</Text>
        </View>

        <Text style={styles.cap}>This app / mo</Text>
        <View style={styles.row}>
          <View style={[styles.barAccent, {width: `${smallPct}%`}]} />
          <Text style={styles.barAccentTxt}>${APP_PRICE}</Text>
        </View>

        <Text style={styles.footnote}>
          Quitting pays for the app <Text style={styles.bold}>{times} times over</Text>.
        </Text>

        <View style={styles.spacer} />
        <Button label="Continue" onPress={next} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingHorizontal: gutter, paddingTop: spacing.xl, paddingBottom: spacing.xxl},
  headline: {...T.h2, lineHeight: 30, color: colors.ink, marginBottom: spacing.xxl},
  underline: {borderBottomWidth: 2, borderColor: colors.ink},
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.cardSm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xxl,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTxt: {fontSize: 24, color: colors.ink, lineHeight: 26},
  stepVal: {...T.body, fontWeight: '500', color: colors.ink},
  cap: {...T.label, color: colors.muted, marginBottom: spacing.sm},
  barDark: {
    height: 36,
    backgroundColor: colors.ink,
    borderRadius: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: spacing.md,
    marginBottom: spacing.xl,
  },
  barDarkTxt: {color: colors.paper, ...T.body, fontWeight: '500'},
  row: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  barAccent: {height: 36, backgroundColor: colors.accent, borderRadius: 8, minWidth: 14},
  barAccentTxt: {...T.body, fontWeight: '500', color: colors.ink},
  footnote: {
    ...T.body,
    textAlign: 'center',
    marginTop: spacing.xxl,
    color: colors.ink,
  },
  bold: {fontWeight: '700'},
  spacer: {flex: 1},
});
