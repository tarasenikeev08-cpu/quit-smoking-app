import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Screen from '@/components/Screen';
import Icon from '@/components/Icon';
import Flame from '@/components/Flame';
import {colors, radius} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useRank, useStreakDays, useLifetimeDays, useSavings} from '@/store/selectors';
import {RANKS} from '@/lib/ranks';
import {companionNameForRank} from '@/lib/companions';

/**
 * RANK, per Ember_Proportions.md.
 * header 6.5% · rank name 6% · gap 2% · saved hero 21% · gap 1.5% ·
 * lifetime/streak row 9.5% · gap 2% · progress 5% ·
 * [THE ONE FLEX GAP] · tier list 13.8% · gap 1.5% · note 5.5% · slip link 4%
 */
export default function RankScreen() {
  const nav = useNavigation<any>();
  const {current, next, progress, daysToNext} = useRank();
  const streak = useStreakDays();
  const lifetime = useLifetimeDays();
  const {saved, packs, habit} = useSavings();
  const currentIndex = RANKS.findIndex(r => r.key === current.key);
  const m = useMetrics();
  const T = m.type;

  const tierH = m.h(0.046);

  return (
    <Screen scroll contentStyle={[styles.content, {paddingHorizontal: m.gutter}]}>
      <View style={[styles.header, {height: m.band.header}]}>
        <Text style={[T.label, {color: colors.muted}]}>Your rank</Text>
      </View>

      <View style={[styles.rankNameBand, {height: m.h(0.06)}]}>
        <Text style={[T.h1, styles.rankName, {color: colors.ink}]}>{current.name.toUpperCase()}</Text>
      </View>

      <View style={{height: m.h(0.02)}} />

      {/* saved hero — the band the companion owns on Home */}
      <View style={[styles.savedCard, {height: m.h(0.21)}]}>
        <Text style={[T.label, {color: colors.muted}]}>Saved so far</Text>
        <Text style={[T.dayCount, styles.savedV, {color: colors.ink}]}>
          {habit.currencySymbol}
          {saved}
        </Text>
        <Text style={[T.caption, {color: colors.muted}]}>≈ {packs} packs not bought</Text>
      </View>

      <View style={{height: m.h(0.015)}} />

      <View style={[styles.miniRow, {height: m.h(0.095), gap: m.statGap}]}>
        <View style={styles.mini}>
          <Text style={[T.statValue, {color: colors.ink}]}>{lifetime}</Text>
          <Text style={[T.label, {color: colors.muted}]}>lifetime days</Text>
        </View>
        <View style={styles.mini}>
          <View style={styles.miniVRow}>
            <Text style={[T.statValue, {color: colors.ink}]}>{streak}</Text>
            <Flame size={Math.round(T.statValue.fontSize * 0.55)} />
          </View>
          <Text style={[T.label, {color: colors.muted}]}>streak</Text>
        </View>
      </View>

      <View style={{height: m.h(0.02)}} />

      <View style={[styles.progressBand, {height: m.h(0.05)}]}>
        {next && (
          <>
            <View style={styles.progressLabels}>
              <Text style={[T.caption, {color: colors.muted}]}>{current.name}</Text>
              <Text style={[T.caption, {color: colors.muted}]}>
                {next.name} · {daysToNext}d
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, {width: `${Math.round(progress * 100)}%`}]} />
            </View>
          </>
        )}
      </View>

      {/* ---- THE ONE FLEX GAP ---- */}
      <View style={styles.flexGap} />

      <View>
        {RANKS.map((r, i) => {
          const done = i < currentIndex;
          const isCurrent = i === currentIndex;
          if (i < currentIndex - 1 || i > currentIndex + 1) return null;
          return (
            <View
              key={r.key}
              style={[styles.tier, {height: tierH}, isCurrent && styles.tierCurrent, done && styles.tierDone]}>
              {done ? (
                <Icon name="checkFilled" size={18} />
              ) : isCurrent ? (
                <Icon name="flame" size={18} color={colors.accent} />
              ) : (
                <Icon name="lock" size={18} color={colors.frame} />
              )}
              <Text style={[T.body, styles.tierName, isCurrent && {color: colors.paper, fontWeight: '500'}]}>
                {r.name}
              </Text>
              <Text style={[T.caption, {color: isCurrent ? colors.mutedOnInk : colors.muted}]}>
                {companionNameForRank(r)} · {r.threshold}d{isCurrent ? ' · now' : ''}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{height: m.h(0.015)}} />

      <View style={[styles.note, {height: m.h(0.055)}]}>
        <Icon name="shieldCheck" size={14} />
        <Text style={[T.caption, styles.noteTxt]}>
          A slip breaks your streak, not your rank or your savings.
        </Text>
      </View>

      <Pressable onPress={() => nav.navigate('Slip')} hitSlop={8} style={[styles.slipLink, {height: m.h(0.04)}]}>
        <Text style={[T.caption, styles.slipLinkTxt]}>Had a slip?</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {flexGrow: 1},
  header: {alignItems: 'center', justifyContent: 'flex-end'},
  rankNameBand: {justifyContent: 'center'},
  rankName: {textAlign: 'center'},

  savedCard: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  savedV: {marginVertical: 4},

  miniRow: {flexDirection: 'row'},
  mini: {
    flex: 1,
    alignSelf: 'stretch',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.stat,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniVRow: {flexDirection: 'row', alignItems: 'center', gap: 4},

  progressBand: {justifyContent: 'flex-end'},
  progressLabels: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8},
  track: {height: 8, backgroundColor: colors.border, borderRadius: 10, overflow: 'hidden'},
  fill: {height: '100%', backgroundColor: colors.ink},

  flexGap: {flex: 1},

  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.hair,
  },
  tierDone: {opacity: 0.5},
  tierCurrent: {
    backgroundColor: colors.ink,
    borderRadius: radius.stat,
    borderBottomWidth: 0,
  },
  tierName: {flex: 1, color: colors.ink},

  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.softer,
    borderRadius: radius.stat,
  },
  noteTxt: {flex: 1, color: '#6A6A64'},

  slipLink: {alignItems: 'center', justifyContent: 'center'},
  slipLinkTxt: {color: colors.muted, textDecorationLine: 'underline'},
});
