import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import Icon from '@/components/Icon';
import {Button} from '@/components/ui';
import {colors, spacing} from '@/theme';
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
  wrap: {flex: 1, paddingHorizontal: spacing.lg, paddingTop: 8},
  title: {textAlign: 'center', fontSize: 18, fontWeight: '500', lineHeight: 23, color: colors.ink},
  flame: {alignItems: 'center', paddingTop: 12, paddingBottom: 2},
  atRisk: {textAlign: 'center', fontSize: 11, color: colors.muted},
  chips: {flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: 14},
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipTxt: {fontSize: 10, color: colors.ink},
  restoreCard: {
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  restoreDisabled: {opacity: 0.45},
  restoreInfo: {flex: 1},
  restoreTitle: {fontSize: 13, fontWeight: '500', color: colors.ink},
  restoreSub: {fontSize: 10, color: colors.muted, marginTop: 2},
  restoreTag: {borderWidth: 1.5, borderColor: colors.ink, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4},
  restoreTagTxt: {fontSize: 11, color: colors.ink},
  spacer: {flex: 1, minHeight: 20},
  cta: {marginBottom: 9},
  startOver: {alignItems: 'center', paddingBottom: 4},
  startOverTxt: {fontSize: 11, color: colors.muted},
});
