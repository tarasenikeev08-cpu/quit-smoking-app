import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

import Screen from '@/components/Screen';
import Companion from '@/components/Companion';
import Icon from '@/components/Icon';
import {colors, gutter, radius, spacing, type as T} from '@/theme';
import {useStore} from '@/store';
import {useUnlocked, useRank} from '@/store/selectors';
import {COMPANIONS} from '@/lib/companions';

export default function CollectionScreen() {
  const unlocked = useUnlocked();
  const equipped = useStore(s => s.equipped);
  const equip = useStore(s => s.equip);
  const {next, daysToNext} = useRank();

  const unlockedCount = unlocked.length;
  const equippedMeta = COMPANIONS.find(c => c.id === equipped) ?? COMPANIONS[0];

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Collection</Text>
        <Text style={styles.count}>{unlockedCount} of {COMPANIONS.length} unlocked</Text>
      </View>

      <View style={styles.equipCard}>
        <Companion id={equippedMeta.id} size={40} />
        <View style={styles.equipInfo}>
          <Text style={styles.equipName}>{equippedMeta.name}</Text>
          <Text style={styles.equipSub}>Equipped</Text>
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
                  <Text style={styles.cellName}>{c.name}</Text>
                </>
              ) : isNext ? (
                <>
                  <Companion id={c.id} size={34} face={false} locked />
                  <Text style={styles.cellNextTxt}>
                    {c.rankName} · {daysToNext}d
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="lock" size={20} color={colors.frame} />
                  <Text style={styles.cellLockedTxt}>{c.name}</Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.footnote}>Tap an unlocked companion to equip it.</Text>
    </Screen>
  );
}

const COL_GAP = 12;

const styles = StyleSheet.create({
  content: {paddingHorizontal: gutter, paddingTop: spacing.sm},
  header: {alignItems: 'center'},
  kicker: {...T.label, color: colors.muted},
  count: {...T.h2, color: colors.ink, marginTop: spacing.xs},

  equipCard: {
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.card,
    padding: spacing.lg,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  equipInfo: {flex: 1},
  equipName: {...T.body, fontWeight: '500', color: colors.ink},
  equipSub: {...T.caption, color: colors.muted},

  grid: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COL_GAP,
  },
  cell: {
    flexBasis: '30%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderRadius: radius.cardSm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    minHeight: 88,
    justifyContent: 'center',
  },
  cellUnlocked: {borderColor: colors.ink, backgroundColor: colors.card},
  cellEquipped: {borderColor: colors.ink, backgroundColor: colors.soft},
  cellNext: {borderColor: colors.ink, borderStyle: 'dashed'},
  cellLocked: {borderColor: colors.hair},
  cellName: {...T.caption, fontSize: 11, marginTop: spacing.xs, color: colors.ink},
  cellNextTxt: {
    ...T.caption,
    fontSize: 11,
    marginTop: spacing.xs,
    fontWeight: '500',
    color: colors.ink,
    textAlign: 'center',
  },
  cellLockedTxt: {...T.caption, fontSize: 11, marginTop: spacing.sm, color: colors.frame},

  footnote: {...T.caption, color: colors.muted, textAlign: 'center', marginTop: spacing.xxl},
});
