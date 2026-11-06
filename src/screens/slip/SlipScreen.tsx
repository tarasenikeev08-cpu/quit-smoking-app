import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import Icon from '@/components/Icon';
import {Button} from '@/components/ui';
import {colors, controls, gutter, radius, spacing, type as T} from '@/theme';
import {useStore} from '@/store';
import {useStreakDays, useSavings} from '@/store/selectors';

export default function SlipScreen() {
  const nav = useNavigation<any>();
  const streak = useStreakDays();
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
      <View style={styles.wrap}>
        <Text style={styles.title}>One slip isn’t a reset.</Text>

        <View style={styles.flame}>
          <Flame size={54} layers={2} cold />
        </View>
        <Text style={styles.atRisk}>{streak}-day streak at risk</Text>

        <View style={styles.chips}>
          <View style={styles.chip}>
            <Icon name="trophy" size={12} />
            <Text style={styles.chipTxt}>Rank safe</Text>
          </View>
          <View style={styles.chip}>
            <Icon name="coins" size={12} />
            <Text style={styles.chipTxt}>
              {habit.currencySymbol}
              {saved} saved
            </Text>
          </View>
        </View>

        <View style={[styles.restoreCard, !canRestore && styles.restoreDisabled]}>
          <View style={styles.restoreInfo}>
            <Text style={styles.restoreTitle}>Use a restore</Text>
            <Text style={styles.restoreSub}>Keep your {streak}-day flame</Text>
          </View>
          <View style={styles.restoreTag}>
            <Text style={styles.restoreTagTxt}>{restoresLeft} free left</Text>
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
          <Text style={styles.startOverTxt}>Start fresh at Day 1</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingHorizontal: gutter, paddingTop: spacing.sm, paddingBottom: spacing.lg},
  title: {...T.h2, textAlign: 'center', lineHeight: 28, color: colors.ink},
  flame: {alignItems: 'center', paddingTop: spacing.lg, paddingBottom: spacing.xs},
  atRisk: {...T.caption, textAlign: 'center', color: colors.muted},
  chips: {flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: controls.chip.height,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: controls.chip.radius,
    paddingHorizontal: 14,
  },
  chipTxt: {fontSize: 11, fontWeight: '500', color: colors.ink},
  restoreCard: {
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.card,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  restoreDisabled: {opacity: 0.45},
  restoreInfo: {flex: 1},
  restoreTitle: {...T.body, fontWeight: '500', color: colors.ink},
  restoreSub: {...T.caption, color: colors.muted, marginTop: spacing.xs},
  restoreTag: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: controls.chip.radius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  restoreTagTxt: {...T.caption, color: colors.ink},
  spacer: {flex: 1, minHeight: spacing.xl},
  cta: {marginBottom: spacing.md},
  startOver: {alignItems: 'center', paddingBottom: spacing.xs},
  startOverTxt: {...T.caption, color: colors.muted},
});
