import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

import Screen from '@/components/Screen';
import Companion from '@/components/Companion';
import Icon from '@/components/Icon';
import {colors, radius} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {useUnlocked, useRank} from '@/store/selectors';
import {COMPANIONS} from '@/lib/companions';

export default function CollectionScreen() {
  const unlocked = useUnlocked();
  const m = useMetrics();
  const T = m.type;
  const equipped = useStore(s => s.equipped);
  const equip = useStore(s => s.equip);
  const {next, daysToNext} = useRank();

  const unlockedCount = unlocked.length;
  const equippedMeta = COMPANIONS.find(c => c.id === equipped) ?? COMPANIONS[0];

  return (
    <Screen scroll contentStyle={[styles.content, {paddingHorizontal: m.gutter}]}>
      <View style={[styles.header, {height: m.band.header}]}>
        <Text style={[T.label, {color: colors.muted}]}>Collection</Text>
        <Text style={[T.h2, {color: colors.ink}]}>{unlockedCount} of {COMPANIONS.length} unlocked</Text>
      </View>

      <View style={styles.equipCard}>
        <Companion id={equippedMeta.id} size={40} />
        <View style={styles.equipInfo}>
          <Text style={[T.body, {fontWeight: "500", color: colors.ink}]}>{equippedMeta.name}</Text>
          <Text style={[T.caption, {color: colors.muted}]}>Equipped</Text>
        </View>
        <Icon name="check" size={18} />
      </View>

      <View style={styles.grid}>
        {COMPANIONS.map(c => {
          const isUnlocked = unlocked.includes(c.id);
          const isNext = next && next.companion === c.id;
          const isEquipped = equipped === c.id;

          return (
            <Pressable
              key={c.id}
              disabled={!isUnlocked}
              onPress={() => equip(c.id)}
              style={[
                styles.cell,
                isUnlocked && styles.cellUnlocked,
                isEquipped && styles.cellEquipped,
                isNext && styles.cellNext,
                !isUnlocked && !isNext && styles.cellLocked,
              ]}>
              {isUnlocked ? (
                <>
                  <Companion id={c.id} size={34} face={false} />
                  <Text style={[T.caption, {color: colors.ink, marginTop: 4}]}>{c.name}</Text>
                </>
              ) : isNext ? (
                <>
                  <Companion id={c.id} size={34} face={false} locked />
                  <Text style={[T.caption, styles.cellNextTxt, {color: colors.ink}]}>
                    {c.rankName} · {daysToNext}d
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="lock" size={20} color={colors.frame} />
                  <Text style={[T.caption, {color: colors.frame, marginTop: 6}]}>{c.name}</Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.flexGap} />
      <Text style={[T.caption, styles.footnote, {color: colors.muted}]}>Tap an unlocked companion to equip it.</Text>
    </Screen>
  );
}

const COL_GAP = 12;

const styles = StyleSheet.create({
  content: {flexGrow: 1},
  header: {alignItems: 'center', justifyContent: 'flex-end'},

  equipCard: {
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.card,
    padding: 16,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  equipInfo: {flex: 1},

  grid: {marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: COL_GAP},
  cell: {
    flexBasis: '30%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderRadius: radius.cardSm,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 88,
    justifyContent: 'center',
  },
  cellUnlocked: {borderColor: colors.ink, backgroundColor: colors.card},
  cellEquipped: {borderColor: colors.ink, backgroundColor: colors.soft},
  cellNext: {borderColor: colors.ink, borderStyle: 'dashed'},
  cellLocked: {borderColor: colors.hair},
  cellNextTxt: {marginTop: 4, fontWeight: '500', textAlign: 'center'},

  // THE ONE FLEX GAP — footnote anchored to the bottom
  flexGap: {flex: 1, minHeight: 16},
  footnote: {textAlign: 'center', marginTop: 16, paddingBottom: 8},
});
