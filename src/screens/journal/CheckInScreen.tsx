import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Screen from '@/components/Screen';
import {Button, Pill} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {TRIGGERS, Trigger} from '@/lib/journal';

const CRAVING_STEPS = [1, 2, 3, 4, 5];
const MOODS = [1, 2, 3, 4, 5];

export default function CheckInScreen() {
  const nav = useNavigation<any>();
  const m = useMetrics();
  const T = m.type;
  const logEntry = useStore(s => s.logEntry);

  const [craving, setCraving] = useState(3);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [mood, setMood] = useState(3);

  const toggle = (t: Trigger) =>
    setTriggers(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));

  const save = () => {
    logEntry({craving, triggers, mood});
    nav.navigate('Patterns');
  };

  return (
    <Screen scroll contentStyle={[styles.content, {paddingHorizontal: m.gutter}]}>
      <View style={[styles.headerRow, {height: m.band.header}]}>
        <Text style={[T.h2, {color: colors.ink}]}>How was today?</Text>
        <Pressable onPress={() => nav.navigate('Patterns')} hitSlop={8}>
          <Text style={[T.body, {color: colors.muted}]}>Skip</Text>
        </Pressable>
      </View>
      <Text style={[T.caption, {color: colors.muted}]}>15 seconds. Builds your pattern.</Text>

      <Text style={[T.label, styles.sectionLabel, {color: colors.muted}]}>Craving strength</Text>
      <View style={styles.cravingRow}>
        {CRAVING_STEPS.map(n => (
          <Pressable key={n} style={styles.cravingHit} onPress={() => setCraving(n)}>
            <View style={[styles.cravingBar, n <= craving ? styles.cravingOn : styles.cravingOff]} />
          </Pressable>
        ))}
        <Text style={[T.body, styles.cravingNum, {color: colors.ink}]}>{craving}</Text>
      </View>

      <Text style={[T.label, styles.sectionLabel, {color: colors.muted}]}>Any triggers?</Text>
      <View style={styles.pills}>
        {TRIGGERS.map(t => (
          <Pill key={t} label={t} active={triggers.includes(t)} onPress={() => toggle(t)} />
        ))}
      </View>

      <Text style={[T.label, styles.sectionLabel, {color: colors.muted}]}>Mood</Text>
      <View style={styles.moodRow}>
        {MOODS.map(n => (
          <Pressable key={n} onPress={() => setMood(n)} hitSlop={6}>
            <Text
              style={[
                {fontSize: T.statValue.fontSize},
                n === mood ? styles.moodActive : styles.moodIdle,
              ]}>
              {n === mood ? '●' : '○'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.spacer} />
      <Button label="Save" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {flexGrow: 1},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  sectionLabel: {marginTop: 24, marginBottom: 12},

  cravingRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  cravingHit: {flex: 1, paddingVertical: 8},
  cravingBar: {height: 8, borderRadius: 10},
  cravingOn: {backgroundColor: colors.ink},
  cravingOff: {backgroundColor: colors.border},
  cravingNum: {fontWeight: '500', marginLeft: 8},

  pills: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},

  moodRow: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4},
  moodActive: {color: colors.ink},
  moodIdle: {color: colors.ink, opacity: 0.3},

  // THE ONE FLEX GAP — Save is anchored to the bottom
  spacer: {flex: 1, minHeight: 20},
});
