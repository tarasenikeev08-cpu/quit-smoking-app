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
      <View style={[styles.wrap, {paddingHorizontal: m.gutter}]}>
        <Text style={[T.h2, styles.title, {color: colors.ink}]}>One slip isn’t a reset.</Text>

        <View style={styles.flame}>
          <Flame size={54} layers={2} cold />
        </View>
        <Text style={[T.caption, styles.atRisk, {color: colors.muted}]}>{streak}-day streak at risk</Text>

        <View style={styles.chips}>
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

        <View style={[styles.restoreCard, !canRestore && styles.restoreDisabled]}>
          <View style={styles.restoreInfo}>
            <Text style={[T.body, {fontWeight: "500", color: colors.ink}]}>Use a restore</Text>
            <Text style={[T.caption, {color: colors.muted, marginTop: 4}]}>Keep your {streak}-day flame</Text>
          </View>
          <View style={styles.restoreTag}>
            <Text style={[T.caption, {color: colors.ink}]}>{restoresLeft} free left</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <Button
          label="Restore flame"
          onPress={onRestore}
          disabled={!canRestore}
          style={styles.cta}
        />
        <Pressable onPress={onStartOver} hitSlop={8} style={styles.startOver}>
          <Text style={[T.caption, {color: colors.muted}]}>Start fresh at Day 1</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingTop: 8, paddingBottom: 16},
  title: {textAlign: 'center'},
  flame: {alignItems: 'center', paddingTop: 16, paddingBottom: 4},
  atRisk: {textAlign: 'center'},
  chips: {flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 16},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
  },
  restoreCard: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.card,
    padding: 16,
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
  // THE ONE FLEX GAP — CTA anchored to the bottom
  spacer: {flex: 1, minHeight: 20},
  cta: {marginBottom: 12},
  startOver: {alignItems: 'center', paddingBottom: 4},
});
