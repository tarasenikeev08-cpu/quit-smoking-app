import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import Companion from '@/components/Companion';
import Icon from '@/components/Icon';
import {Stat} from '@/components/ui';
import {colors, spacing} from '@/theme';
import {useStore} from '@/store';
import {useStreakDays, useRank, useSavings} from '@/store/selectors';
import {haptic} from '@/lib/platform';

export default function HomeScreen() {
  const streak = useStreakDays();
  const {current} = useRank();
  const {saved, avoided, habit} = useSavings();
  const equipped = useStore(s => s.equipped);
  const [heldToday, setHeldToday] = useState(false);

  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.topRow}>
          <Text style={styles.rank}>{current.name.toUpperCase()}</Text>
          <Icon name="box" size={19} />
        </View>

        <View style={styles.hero}>
          <Companion id={equipped} size={150} shadow />
        </View>

        <View style={styles.countWrap}>
          <View style={styles.countRow}>
            <Text style={styles.count}>{streak}</Text>
            <Flame size={22} layers={2} />
          </View>
          <Text style={styles.countLabel}>days clean</Text>
        </View>

        <View style={styles.stats}>
          <Stat k="Saved" v={`${habit.currencySymbol}${saved}`} />
          <Stat k="Avoided" v={avoided} />
        </View>

        <Pressable
          onPress={() => {
            haptic('success');
            setHeldToday(true);
          }}
          style={[styles.hold, heldToday && styles.holdDone]}>
          <Text style={[styles.holdTxt, heldToday && {color: colors.paper}]}>
            {heldToday ? 'Held today' : 'Hold — still clean'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingHorizontal: spacing.lg},
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
  },
  rank: {fontSize: 12, fontWeight: '500', letterSpacing: 1.5, color: colors.ink},
  hero: {height: 190, alignItems: 'center', justifyContent: 'center'},
  countWrap: {alignItems: 'center', marginTop: -6},
  countRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  count: {fontSize: 44, fontWeight: '500', lineHeight: 46, color: colors.ink},
  countLabel: {
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  stats: {flexDirection: 'row', gap: 10, marginTop: 20},
  hold: {
    marginTop: 18,
    height: 56,
    borderRadius: 40,
    backgroundColor: colors.pill,
    borderWidth: 1.5,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdDone: {backgroundColor: colors.ink},
  holdTxt: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.ink,
  },
});
