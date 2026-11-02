import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Screen from '@/components/Screen';
import Icon from '@/components/Icon';
import Flame from '@/components/Flame';
import {colors, spacing} from '@/theme';
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
          if (!done && !isCurrent && i > currentIndex + 1) return null; // keep it short
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
  content: {paddingHorizontal: spacing.lg, paddingTop: 10},
  header: {alignItems: 'center'},
  kicker: {fontSize: 10, color: colors.muted, letterSpacing: 2, textTransform: 'uppercase'},
  rankName: {fontSize: 24, fontWeight: '500', letterSpacing: 1, marginTop: 4, color: colors.ink},

  savedCard: {
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  savedK: {fontSize: 10, color: colors.muted, letterSpacing: 1.5, textTransform: 'uppercase'},
  savedV: {fontSize: 32, fontWeight: '500', marginTop: 2, color: colors.ink},
  savedSub: {fontSize: 10, color: colors.muted, marginTop: 2},

  miniRow: {flexDirection: 'row', gap: 10, marginTop: 10},
  mini: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  miniVRow: {flexDirection: 'row', alignItems: 'center', gap: 3},
  miniV: {fontSize: 17, fontWeight: '500', color: colors.ink},
  miniK: {fontSize: 9, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5},

  progressWrap: {marginTop: 16},
  progressLabels: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  progressLabel: {fontSize: 10, color: colors.muted},
  track: {height: 8, backgroundColor: colors.border, borderRadius: 10, overflow: 'hidden'},
  fill: {height: '100%', backgroundColor: colors.ink},

  ladder: {marginTop: 16},
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.hair,
  },
  tierDone: {opacity: 0.5},
  tierCurrent: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    borderBottomWidth: 0,
    marginVertical: 2,
  },
  tierName: {flex: 1, fontSize: 13, color: colors.ink},
  tierDays: {fontSize: 11, color: colors.muted},

  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    padding: 12,
    backgroundColor: colors.softer,
    borderRadius: 12,
  },
  noteTxt: {flex: 1, fontSize: 10, color: '#6A6A64', lineHeight: 15},

  slipLink: {alignItems: 'center', marginTop: 18},
  slipLinkTxt: {fontSize: 12, color: colors.muted, textDecorationLine: 'underline'},
});
