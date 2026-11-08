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
const MAX_SPEND = 2000;

/**
 * ONBOARDING — THE MATHS, per Ember_Proportions.md.
 * top 6.5% · headline 14% · gap 3.5% · stepper 10% · gap 4% ·
 * comparison 23% (two identical bars) · gap 4% · footnote 9% ·
 * [THE ONE FLEX GAP] · Continue 6.2% · bottom 3.5%
 *
 * Both comparison bars are the SAME bar — same height, radius and value type —
 * so only their LENGTH carries the comparison.
 */
/** One comparison bar: a full-width track with a fill of `pct` width. */
function Bar({
  label,
  value,
  pct,
  color,
  valueColor,
  height,
  T,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
  valueColor: string;
  height: number;
  T: ReturnType<typeof useMetrics>['type'];
}) {
  const inside = pct >= 26;
  return (
    <View style={styles.barGroup}>
      <Text style={[T.label, styles.barLabel, {color: colors.muted}]}>{label}</Text>
      <View style={[styles.track, {height, borderRadius: radius.stat}]}>
        <View
          style={[
            styles.fill,
            {width: `${pct}%`, backgroundColor: color, borderRadius: radius.stat},
          ]}>
          {inside && <Text style={[T.body, styles.barValue, {color: valueColor}]}>{value}</Text>}
        </View>
        {!inside && (
          <Text style={[T.body, styles.barValue, styles.barValueOut, {color: colors.ink}]}>
            {value}
          </Text>
        )}
      </View>
    </View>
  );
}

export default function MathsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  const setHabit = useStore(s => s.setHabit);
  const m = useMetrics();
  const T = m.type;
  const [spend, setSpend] = useState(DEFAULT_HABIT.monthlySpend);

  const times = Math.max(1, Math.round(spend / APP_PRICE));
  const barH = m.h(0.065);
  const stepSize = m.h(0.055);
  // the app bar is the same bar, scaled to its share of the bigger number
  const appPct = Math.max(4, Math.min(100, (APP_PRICE / spend) * 100));

  const next = () => {
    setHabit(spend);
    nav.navigate('Paywall');
  };

  return (
    <Screen>
      <View style={[styles.wrap, {paddingHorizontal: m.gutter, paddingTop: m.band.header}]}>
        <View style={[styles.headlineBand, {height: m.h(0.14)}]}>
          <Text style={[T.h2, styles.headline, {color: colors.ink, lineHeight: Math.round(T.h2.fontSize * 1.3)}]}>
            You spend about <Text style={styles.underline}>${spend}</Text> a month on cigarettes.
          </Text>
        </View>

        <View style={{height: m.h(0.035)}} />

        <View style={[styles.stepper, {height: m.h(0.1)}]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Spend less"
            style={[styles.stepBtn, {height: stepSize, width: stepSize, borderRadius: stepSize / 2}]}
            onPress={() => setSpend(s => Math.max(STEP, s - STEP))}>
            <Text style={[T.h2, {color: colors.ink}]}>−</Text>
          </Pressable>
          <Text style={[T.body, {fontWeight: '500', color: colors.ink}]}>${spend}/mo</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Spend more"
            style={[styles.stepBtn, {height: stepSize, width: stepSize, borderRadius: stepSize / 2}]}
            onPress={() => setSpend(s => Math.min(MAX_SPEND, s + STEP))}>
            <Text style={[T.h2, {color: colors.ink}]}>+</Text>
          </Pressable>
        </View>

        <View style={{height: m.h(0.04)}} />

        {/* comparison — both values on the SAME bar, against the same track,
            so only the LENGTH differs */}
        <View style={[styles.comparison, {height: m.h(0.23)}]}>
          <Bar
            label="Cigarettes / mo"
            value={`${'$'}${spend}`}
            pct={100}
            color={colors.ink}
            valueColor={colors.onInk}
            height={barH}
            T={T}
          />
          <Bar
            label="This app / mo"
            value={`${'$'}${APP_PRICE}`}
            pct={appPct}
            color={colors.accent}
            valueColor={colors.ink}
            height={barH}
            T={T}
          />
        </View>

        <View style={{height: m.h(0.04)}} />

        <View style={[styles.footnoteBand, {height: m.h(0.09)}]}>
          <Text style={[T.body, styles.footnote, {color: colors.ink}]}>
            Quitting pays for the app <Text style={styles.bold}>{times} times over</Text>.
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
  headline: {},
  // nested Text ignores borders on iOS/Android, so a border "underline" only
  // ever showed on web; a text decoration renders everywhere
  underline: {textDecorationLine: 'underline', textDecorationColor: colors.ink},

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: 10,
  },
  stepBtn: {backgroundColor: colors.pill, alignItems: 'center', justifyContent: 'center'},

  comparison: {justifyContent: 'space-evenly'},
  barGroup: {},
  barLabel: {marginBottom: 8},
  track: {flexDirection: 'row', alignItems: 'center', backgroundColor: colors.pill, overflow: 'hidden'},
  fill: {height: '100%', alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 12},
  barValue: {fontWeight: '500'},
  barValueOut: {marginLeft: 12},

  footnoteBand: {justifyContent: 'center'},
  footnote: {textAlign: 'center'},
  bold: {fontWeight: '700'},

  flexGap: {flex: 1},
});
