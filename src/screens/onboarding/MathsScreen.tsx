import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Screen from '@/components/Screen';
import {Button} from '@/components/ui';
import {colors, spacing} from '@/theme';
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
  wrap: {flex: 1, paddingHorizontal: spacing.lg, paddingTop: 18, paddingBottom: spacing.xl},
  headline: {fontSize: 16, fontWeight: '500', lineHeight: 21, color: colors.ink, marginBottom: 18},
  underline: {borderBottomWidth: 2, borderColor: colors.ink},
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 20,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTxt: {fontSize: 22, color: colors.ink, lineHeight: 24},
  stepVal: {fontSize: 16, fontWeight: '500', color: colors.ink},
  cap: {
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  barDark: {
    height: 30,
    backgroundColor: colors.ink,
    borderRadius: 6,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 10,
    marginBottom: 16,
  },
  barDarkTxt: {color: colors.paper, fontSize: 13, fontWeight: '500'},
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  barAccent: {height: 30, backgroundColor: colors.accent, borderRadius: 6, minWidth: 12},
  barAccentTxt: {fontSize: 13, fontWeight: '500', color: colors.ink},
  footnote: {textAlign: 'center', fontSize: 12, marginTop: 20, lineHeight: 17, color: colors.ink},
  bold: {fontWeight: '700'},
  spacer: {flex: 1},
});
