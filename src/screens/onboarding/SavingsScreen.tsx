import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {colors, radius} from '@/theme';
import {useMetrics, Metrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {HABITS, formatAmount, formatMoney, formatPrice, monthlySpend, unitFor} from '@/lib/savings';
import type {OnboardingParamList} from '@/navigation/types';
import {OnboardingStep} from './flow';

/** The subscription price the paywall stub offers after the intro month. */
const APP_PRICE = 5;

/**
 * STEP 4 — THE MATHS. The user's real monthly spend (about $120 at the
 * moderate-smoker defaults) against what Ember costs.
 * frame: header 6.5 · companion 15 · headline 11 · sub 5 ·
 * gap 3 · comparison 23 · gap 3 · footnote 7 · [FLEX] · button 6.2 · bottom 3.5
 */
export default function SavingsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  const m = useMetrics();
  const T = m.type;
  const habit = useStore(s => s.habit);
  const spec = HABITS[habit.type];

  const spend = Math.round(monthlySpend(habit));
  const times = Math.max(1, Math.round(spend / APP_PRICE));
  const appPct = Math.max(4, Math.min(100, (APP_PRICE / Math.max(spend, 1)) * 100));

  return (
    <OnboardingStep
      headline={
        <>
          You spend <Text style={styles.underline}>{formatMoney(habit, spend)}</Text> a{'\u00A0'}month.
        </>
      }
      sub={`${formatAmount(habit.amountPerDay)} ${unitFor(
        habit,
        habit.amountPerDay,
      )} a day at ${formatPrice(habit, habit.pricePerPack)} a ${spec.pack.one}.`}
      cta="Continue"
      onNext={() => nav.navigate('Paywall')}
    >
      <View style={{height: m.h(0.03)}} />
      {/* both values on the SAME bar, against the same track — only length differs */}
      <View style={[styles.comparison, {height: m.h(0.23)}]}>
        <Bar
          m={m}
          label={spec.barLabel}
          value={formatMoney(habit, spend)}
          pct={100}
          color={colors.ink}
          valueColor={colors.onInk}
        />
        <Bar
          m={m}
          label="Ember / mo"
          value={formatMoney(habit, APP_PRICE)}
          pct={appPct}
          color={colors.accent}
          valueColor={colors.ink}
        />
      </View>
      <View style={{height: m.h(0.03)}} />
      <View style={[styles.footBand, {height: m.h(0.07)}]}>
        <Text style={[T.body, styles.foot]}>
          Quitting pays for Ember <Text style={styles.bold}>{times}× over</Text>.
        </Text>
      </View>
    </OnboardingStep>
  );
}

/** One comparison bar: a full-width track with a fill of `pct` width. */
function Bar({
  m,
  label,
  value,
  pct,
  color,
  valueColor,
}: {
  m: Metrics;
  label: string;
  value: string;
  pct: number;
  color: string;
  valueColor: string;
}) {
  const inside = pct >= 26;
  const T = m.type;
  return (
    <View>
      <Text style={[T.label, styles.barLabel]}>{label}</Text>
      <View style={[styles.track, {height: m.h(0.065), borderRadius: radius.stat}]}>
        <View
          style={[
            styles.fill,
            {
              width: `${pct}%`,
              backgroundColor: color,
              borderRadius: radius.stat,
            },
          ]}
        >
          {inside && <Text style={[T.body, styles.barValue, {color: valueColor}]}>{value}</Text>}
        </View>
        {!inside && <Text style={[T.body, styles.barValue, styles.barValueOut]}>{value}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // nested Text ignores borders on iOS/Android; a decoration renders everywhere
  underline: {
    textDecorationLine: 'underline',
    textDecorationColor: colors.ink,
  },
  comparison: {justifyContent: 'space-evenly'},
  barLabel: {color: colors.muted, marginBottom: 8},
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  barValue: {fontWeight: '500'},
  barValueOut: {marginLeft: 12, color: colors.ink},
  footBand: {justifyContent: 'center'},
  foot: {textAlign: 'center', color: colors.ink},
  bold: {fontWeight: '700'},
});
