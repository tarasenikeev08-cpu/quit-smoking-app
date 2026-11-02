import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

import Screen from '@/components/Screen';
import Companion from '@/components/Companion';
import Icon from '@/components/Icon';
import {colors, spacing} from '@/theme';
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

const COL_GAP = 10;

const styles = StyleSheet.create({
  content: {paddingHorizontal: spacing.lg, paddingTop: 10},
  header: {alignItems: 'center'},
  kicker: {fontSize: 10, color: colors.muted, letterSpacing: 2, textTransform: 'uppercase'},
  count: {fontSize: 20, fontWeight: '500', marginTop: 3, color: colors.ink},

  equipCard: {
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  equipInfo: {flex: 1},
  equipName: {fontSize: 14, fontWeight: '500', color: colors.ink},
  equipSub: {fontSize: 10, color: colors.muted},

  grid: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COL_GAP,
  },
  cell: {
    width: `${(100 - 0) / 3}%`,
    flexBasis: '30%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    minHeight: 78,
    justifyContent: 'center',
  },
  cellUnlocked: {borderColor: colors.ink, backgroundColor: colors.card},
  cellEquipped: {borderColor: colors.ink, backgroundColor: colors.soft},
  cellNext: {borderColor: colors.ink, borderStyle: 'dashed'},
  cellLocked: {borderColor: colors.hair},
  cellName: {fontSize: 9, marginTop: 4, color: colors.ink},
  cellNextTxt: {fontSize: 8, marginTop: 4, fontWeight: '500', color: colors.ink, textAlign: 'center'},
  cellLockedTxt: {fontSize: 8, marginTop: 6, color: colors.frame},

  footnote: {fontSize: 10, color: colors.muted, textAlign: 'center', marginTop: 18},
});
