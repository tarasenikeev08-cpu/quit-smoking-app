import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Screen from '@/components/Screen';
import Icon from '@/components/Icon';
import Flame from '@/components/Flame';
import {colors, gutter, radius, spacing, type as T} from '@/theme';
import {useRank, useStreakDays, useLifetimeDays, useSavings} from '@/store/selectors';
import {RANKS} from '@/lib/ranks';

export default function RankScreen() {
  const nav = useNavigation<any>();
  const {current, next, progress, daysToNext} = useRank();
  const streak = useStreakDays();
  const lifetime = useLifetimeDays();
  const {saved, packs, habit} = useSavings();
  const currentIndex = RANKS.findIndex(r => r.key === current.key);

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Your rank</Text>
        <Text style={styles.rankName}>{current.name.toUpperCase()}</Text>
      </View>

      <View style={styles.savedCard}>
        <Text style={styles.savedK}>Saved so far</Text>
        <Text style={styles.savedV}>
          {habit.currencySymbol}
          {saved}
        </Text>
        <Text style={styles.savedSub}>≈ {packs} packs not bought</Text>
      </View>

      <View style={styles.miniRow}>
        <View style={styles.mini}>
          <Text style={styles.miniV}>{lifetime}</Text>
          <Text style={styles.miniK}>lifetime days</Text>
        </View>
        <View style={styles.mini}>
          <View style={styles.miniVRow}>
            <Text style={styles.miniV}>{streak}</Text>
            <Flame size={13} />
          </View>
          <Text style={styles.miniK}>streak</Text>
        </View>
      </View>

      {next && (
        <View style={styles.progressWrap}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{current.name}</Text>
            <Text style={styles.progressLabel}>
              {next.name} · {daysToNext}d
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, {width: `${Math.round(progress * 100)}%`}]} />
          </View>
        </View>
      )}

      <View style={styles.ladder}>
        {RANKS.map((r, i) => {
          const done = i < currentIndex;
          const isCurrent = i === currentIndex;
          // reference shows one completed tier, the current one, and the next
          if (i < currentIndex - 1 || i > currentIndex + 1) return null;
          return (
            <View
              key={r.key}
              style={[
                styles.tier,
                isCurrent && styles.tierCurrent,
                done && styles.tierDone,
              ]}>
              {done ? (
                <Icon name="checkFilled" size={18} />
              ) : isCurrent ? (
                <Icon name="flame" size={18} color={colors.accent} />
              ) : (
                <Icon name="lock" size={18} color={colors.frame} />
              )}
              <Text
                style={[styles.tierName, isCurrent && {color: colors.paper, fontWeight: '500'}]}>
                {r.name}
              </Text>
              <Text style={styles.tierDays}>
                {r.threshold}d{isCurrent ? ' · now' : ''}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.note}>
        <Icon name="shieldCheck" size={14} />
        <Text style={styles.noteTxt}>
          A slip breaks your streak, not your rank or your savings.
        </Text>
      </View>

      <Pressable onPress={() => nav.navigate('Slip')} hitSlop={8} style={styles.slipLink}>
        <Text style={styles.slipLinkTxt}>Had a slip?</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {paddingHorizontal: gutter, paddingTop: spacing.sm},
  header: {alignItems: 'center'},
  kicker: {...T.label, color: colors.muted},
  rankName: {...T.h1, color: colors.ink, marginTop: spacing.xs},

  savedCard: {
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.card,
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  savedK: {...T.label, color: colors.muted},
  savedV: {fontSize: 40, fontWeight: '500', marginTop: spacing.xs, color: colors.ink},
  savedSub: {...T.caption, color: colors.muted, marginTop: spacing.xs},

  miniRow: {flexDirection: 'row', gap: spacing.md, marginTop: spacing.md},
  mini: {
    flex: 1,
    height: 64,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.stat,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniVRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.xs},
  miniV: {...T.statValue, color: colors.ink},
  miniK: {...T.label, color: colors.muted, marginTop: 2},

  progressWrap: {marginTop: spacing.xl},
  progressLabels: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm},
  progressLabel: {...T.caption, color: colors.muted},
  track: {height: 8, backgroundColor: colors.border, borderRadius: 10, overflow: 'hidden'},
  fill: {height: '100%', backgroundColor: colors.ink},

  ladder: {marginTop: spacing.xl},
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 48,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hair,
  },
  tierDone: {opacity: 0.5},
  tierCurrent: {
    backgroundColor: colors.ink,
    borderRadius: radius.stat,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  tierName: {flex: 1, fontSize: 16, color: colors.ink},
  tierDays: {...T.caption, color: colors.muted},

  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.softer,
    borderRadius: radius.stat,
  },
  noteTxt: {flex: 1, ...T.caption, color: '#6A6A64', lineHeight: 17},

  slipLink: {alignItems: 'center', marginTop: spacing.xxl},
  slipLinkTxt: {...T.caption, color: colors.muted, textDecorationLine: 'underline'},
});
