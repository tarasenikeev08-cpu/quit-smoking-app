import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import Icon from '@/components/Icon';
import {Button} from '@/components/ui';
import {colors, radius} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {useStreakDays, useSavings} from '@/store/selectors';

/**
 * SLIP / RECOVERY, per Ember_Proportions.md.
 * top 6.5% · headline 11% · gap 3% · cold flame 20% · at-risk 4.5% ·
 * chips 4.5% · gap 3% · restore card 14% ·
 * [THE ONE FLEX GAP] · CTA 6.2% · start-over link 5% · bottom 3%
 */
export default function SlipScreen() {
  const nav = useNavigation<any>();
  const streak = useStreakDays();
  const m = useMetrics();
  const T = m.type;
  const {saved, habit} = useSavings();
  const restoresLeft = useStore(s => s.streak.restoresLeft);
  const useRestore = useStore(s => s.useRestore);
  const startOver = useStore(s => s.startOver);

  const canRestore = restoresLeft > 0 && streak > 0;

  const onRestore = () => {
    useRestore();
    nav.goBack();
  };
  const onStartOver = () => {
    startOver();
    nav.goBack();
  };

  return (
    <Screen>
      <View style={[styles.wrap, {paddingHorizontal: m.gutter, paddingTop: m.band.header}]}>
        <View style={[styles.titleBand, {height: m.h(0.11)}]}>
          <Text style={[T.h2, styles.title, {color: colors.ink}]}>One slip isn’t a reset.</Text>
        </View>

        <View style={{height: m.h(0.03)}} />

        <View style={[styles.flameBand, {height: m.h(0.2)}]}>
          <Flame size={Math.round(m.h(0.16) / 1.25)} layers={2} cold />
        </View>

        <View style={[styles.atRiskBand, {height: m.h(0.045)}]}>
          <Text style={[T.caption, styles.atRisk, {color: colors.muted}]}>
            {streak}-day streak at risk
          </Text>
        </View>

        <View style={{height: m.h(0.03)}} />

        <View style={[styles.chips, {height: m.h(0.045)}]}>
          <View style={[styles.chip, {height: m.controls.chip.height, borderRadius: m.controls.chip.radius}]}>
            <Icon name="trophy" size={12} />
            <Text style={[T.caption, {color: colors.ink}]}>Rank safe</Text>
          </View>
          <View style={[styles.chip, {height: m.controls.chip.height, borderRadius: m.controls.chip.radius}]}>
            <Icon name="coins" size={12} />
            <Text style={[T.caption, {color: colors.ink}]}>
              {habit.currencySymbol}
              {saved} saved
            </Text>
          </View>
        </View>

        <View style={{height: m.h(0.03)}} />

        <View style={[styles.restoreCard, {height: m.h(0.14)}, !canRestore && styles.restoreDisabled]}>
          <View style={styles.restoreInfo}>
            <Text style={[T.body, {fontWeight: '500', color: colors.ink}]}>Use a restore</Text>
            <Text style={[T.caption, {color: colors.muted, marginTop: 4}]}>
              Keep your {streak}-day flame
            </Text>
          </View>
          <View style={styles.restoreTag}>
            <Text style={[T.caption, {color: colors.ink}]}>{restoresLeft} free left</Text>
          </View>
        </View>

        {/* ---- THE ONE FLEX GAP ---- */}
        <View style={styles.flexGap} />

        <Button label="Restore flame" onPress={onRestore} disabled={!canRestore} />
        <Pressable onPress={onStartOver} hitSlop={8} style={[styles.startOver, {height: m.h(0.05)}]}>
          <Text style={[T.caption, styles.startOverTxt]}>Start fresh at Day 1</Text>
        </Pressable>
        <View style={{height: m.h(0.03)}} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1},
  titleBand: {justifyContent: 'center'},
  title: {textAlign: 'center'},
  flameBand: {alignItems: 'center', justifyContent: 'center'},
  atRiskBand: {justifyContent: 'center'},
  atRisk: {textAlign: 'center'},

  chips: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },

  restoreCard: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.card,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  restoreDisabled: {opacity: 0.45},
  restoreInfo: {flex: 1},
  restoreTag: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  flexGap: {flex: 1},
  startOver: {alignItems: 'center', justifyContent: 'center'},
  startOverTxt: {color: colors.muted},
});
