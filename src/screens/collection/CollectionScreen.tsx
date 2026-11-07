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

/**
 * COLLECTION, per Ember_Proportions.md.
 * header 8.5% · gap 3% · equipped card 11% · gap 3% · grid 45% ·
 * [THE ONE FLEX GAP] · footnote 5%
 *
 * Cells are labelled with the COMPANION's name (Sprout), never its rank's.
 */
export default function CollectionScreen() {
  const unlocked = useUnlocked();
  const m = useMetrics();
  const T = m.type;
  const equipped = useStore(s => s.equipped);
  const equip = useStore(s => s.equip);
  const {next, daysToNext} = useRank();

  const unlockedCount = unlocked.length;
  const equippedMeta = COMPANIONS.find(c => c.id === equipped) ?? COMPANIONS[0];

  const cellH = m.h(0.138);
  const cellGap = m.h(0.018);
  const art = Math.round(cellH * 0.46);

  return (
    <Screen scroll contentStyle={[styles.content, {paddingHorizontal: m.gutter}]}>
      <View style={[styles.header, {height: m.h(0.085)}]}>
        <Text style={[T.label, {color: colors.muted}]}>Collection</Text>
        <Text style={[T.h2, {color: colors.ink}]}>
          {unlockedCount} of {COMPANIONS.length} unlocked
        </Text>
      </View>

      <View style={{height: m.h(0.03)}} />

      <View style={[styles.equipCard, {height: m.h(0.11)}]}>
        <Companion id={equippedMeta.id} size={Math.round(m.h(0.11) * 0.52)} />
        <View style={styles.equipInfo}>
          <Text style={[T.body, {fontWeight: '500', color: colors.ink}]}>{equippedMeta.name}</Text>
          <Text style={[T.caption, {color: colors.muted}]}>Equipped</Text>
        </View>
        <Icon name="check" size={18} />
      </View>

      <View style={{height: m.h(0.03)}} />

      <View style={[styles.grid, {gap: cellGap}]}>
        {COMPANIONS.map(c => {
          const isUnlocked = unlocked.includes(c.id);
          const isNext = !!next && next.companion === c.id && !isUnlocked;
          const isEquipped = equipped === c.id;

          return (
            <Pressable
              key={c.id}
              disabled={!isUnlocked}
              onPress={() => equip(c.id)}
              accessibilityRole="button"
              accessibilityLabel={c.name}
              style={[
                styles.cell,
                {height: cellH},
                isUnlocked && styles.cellUnlocked,
                isEquipped && styles.cellEquipped,
                isNext && styles.cellNext,
                !isUnlocked && !isNext && styles.cellLocked,
              ]}>
              {isUnlocked ? (
                <>
                  <Companion id={c.id} size={art} face={false} />
                  <Text style={[T.caption, styles.cellTxt, {color: colors.ink}]}>{c.name}</Text>
                </>
              ) : isNext ? (
                <>
                  <Companion id={c.id} size={art} face={false} locked />
                  <Text style={[T.caption, styles.cellTxt, styles.cellNextTxt, {color: colors.ink}]}>
                    {c.name} · {daysToNext}d
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="lock" size={Math.round(art * 0.6)} color={colors.frame} />
                  <Text style={[T.caption, styles.cellTxt, {color: colors.frame}]}>{c.name}</Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ---- THE ONE FLEX GAP ---- */}
      <View style={styles.flexGap} />

      <View style={[styles.footnoteBand, {height: m.h(0.05)}]}>
        <Text style={[T.caption, styles.footnote, {color: colors.muted}]}>
          Tap an unlocked companion to equip it.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {flexGrow: 1},
  header: {alignItems: 'center', justifyContent: 'flex-end'},

  equipCard: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.card,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  equipInfo: {flex: 1},

  grid: {flexDirection: 'row', flexWrap: 'wrap'},
  cell: {
    flexBasis: '30%',
    flexGrow: 1,
    borderWidth: 1.5,
    borderRadius: radius.cardSm,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellUnlocked: {borderColor: colors.ink, backgroundColor: colors.card},
  cellEquipped: {borderColor: colors.ink, backgroundColor: colors.soft},
  cellNext: {borderColor: colors.ink, borderStyle: 'dashed'},
  cellLocked: {borderColor: colors.hair},
  cellTxt: {marginTop: 6, textAlign: 'center'},
  cellNextTxt: {fontWeight: '500'},

  flexGap: {flex: 1},
  footnoteBand: {justifyContent: 'center'},
  footnote: {textAlign: 'center'},
});
