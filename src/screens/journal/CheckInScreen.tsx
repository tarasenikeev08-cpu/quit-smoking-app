import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Screen from '@/components/Screen';
import {Button, Pill} from '@/components/ui';
import {colors, spacing} from '@/theme';
import {useStore} from '@/store';
import {TRIGGERS, Trigger} from '@/lib/journal';

const CRAVING_STEPS = [1, 2, 3, 4, 5];
const MOODS = [1, 2, 3, 4, 5];

export default function CheckInScreen() {
  const nav = useNavigation<any>();
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
    <Screen scroll contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>How was today?</Text>
        <Pressable onPress={() => nav.navigate('Patterns')} hitSlop={8}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>15 seconds. Builds your pattern.</Text>

      <Text style={styles.sectionLabel}>Craving strength</Text>
      <View style={styles.cravingRow}>
        {CRAVING_STEPS.map(n => (
          <Pressable key={n} style={styles.cravingHit} onPress={() => setCraving(n)}>
            <View style={[styles.cravingBar, n <= craving ? styles.cravingOn : styles.cravingOff]} />
          </Pressable>
        ))}
        <Text style={styles.cravingNum}>{craving}</Text>
      </View>

      <Text style={styles.sectionLabel}>Any triggers?</Text>
      <View style={styles.pills}>
        {TRIGGERS.map(t => (
          <Pill key={t} label={t} active={triggers.includes(t)} onPress={() => toggle(t)} />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Mood</Text>
      <View style={styles.moodRow}>
        {MOODS.map(n => (
          <Pressable key={n} onPress={() => setMood(n)} hitSlop={6}>
            <Text style={[styles.moodDot, n === mood ? styles.moodActive : styles.moodIdle]}>
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
  content: {paddingHorizontal: spacing.lg, paddingTop: 8, flexGrow: 1},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  title: {fontSize: 16, fontWeight: '500', color: colors.ink},
  skip: {fontSize: 12, color: colors.muted},
  hint: {fontSize: 10, color: colors.muted, marginTop: 2},

  sectionLabel: {
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 22,
    marginBottom: 8,
  },

  cravingRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  cravingHit: {flex: 1, paddingVertical: 8},
  cravingBar: {height: 8, borderRadius: 10},
  cravingOn: {backgroundColor: colors.ink},
  cravingOff: {backgroundColor: colors.border},
  cravingNum: {fontSize: 13, fontWeight: '500', marginLeft: 4, color: colors.ink},

  pills: {flexDirection: 'row', flexWrap: 'wrap', gap: 7},

  moodRow: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4},
  moodDot: {fontSize: 20},
  moodActive: {color: colors.ink},
  moodIdle: {color: colors.ink, opacity: 0.3},

  spacer: {flex: 1, minHeight: 20},
});
