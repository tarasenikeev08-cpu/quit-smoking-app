import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Screen from '@/components/Screen';
import Mood, {MoodValue, MOOD_LABELS} from '@/components/Mood';
import {Button, Pill} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {TRIGGERS, Trigger} from '@/lib/journal';
import {useCheckInStreak, useTodayEntry} from '@/store/selectors';

const CRAVING_STEPS = [1, 2, 3, 4, 5];
const MOODS: MoodValue[] = [1, 2, 3, 4, 5];

/**
 * JOURNAL — CHECK-IN, per Ember_Proportions.md.
 * header 9% · gap 4% · craving 15% · gap 3.5% · triggers 17% · gap 3.5% ·
 * mood 15% · [THE ONE FLEX GAP] · Save 6.2% · bottom 3%
 */
export default function CheckInScreen() {
  const nav = useNavigation<any>();
  const m = useMetrics();
  const T = m.type;
  const logEntry = useStore(s => s.logEntry);
  const todayEntry = useTodayEntry();
  const checkIns = useCheckInStreak();

  const [craving, setCraving] = useState(3);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [mood, setMood] = useState<MoodValue>(3);

  // One check-in per day. If today's exists, the form shows it so it can be
  // adjusted (saving updates it); on a new day the form starts fresh.
  useEffect(() => {
    setCraving(todayEntry?.craving ?? 3);
    setTriggers(todayEntry?.triggers ?? []);
    setMood(((todayEntry?.mood ?? 3) as MoodValue));
  }, [todayEntry]);

  const toggle = (t: Trigger) =>
    setTriggers(prev => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));

  const save = () => {
    logEntry({craving, triggers, mood});
    nav.navigate('Patterns');
  };

  const moodSize = m.w(0.105);

  return (
    <Screen scroll contentStyle={[styles.content, {paddingHorizontal: m.gutter}]}>
      <View style={[styles.headerBand, {height: m.h(0.09)}]}>
        <View style={styles.headerRow}>
          <Text style={[T.h2, {color: colors.ink}]}>How was today?</Text>
          <Pressable onPress={() => nav.navigate('Patterns')} hitSlop={8}>
            <Text style={[T.body, {color: colors.muted}]}>Skip</Text>
          </Pressable>
        </View>
        <Text style={[T.caption, {color: colors.muted}]}>
          {todayEntry
            ? `Checked in today · ${checkIns}-day check-in streak`
            : checkIns > 0
              ? `${checkIns}-day check-in streak — keep it going.`
              : '15 seconds. Builds your pattern.'}
        </Text>
      </View>

      <View style={{height: m.h(0.04)}} />

      <View style={[styles.section, {height: m.h(0.15)}]}>
        <Text style={[T.label, {color: colors.muted}]}>Craving strength</Text>
        <View style={styles.cravingRow}>
          {CRAVING_STEPS.map(n => (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={`Craving ${n}`}
              style={styles.cravingHit}
              onPress={() => setCraving(n)}>
              <View
                style={[
                  styles.cravingBar,
                  {height: m.h(0.014)},
                  n <= craving ? styles.cravingOn : styles.cravingOff,
                ]}
              />
            </Pressable>
          ))}
          <Text style={[T.body, styles.cravingNum, {color: colors.ink}]}>{craving}</Text>
        </View>
      </View>

      <View style={{height: m.h(0.035)}} />

      <View style={[styles.section, {height: m.h(0.17)}]}>
        <Text style={[T.label, {color: colors.muted}]}>Any triggers?</Text>
        <View style={styles.pills}>
          {TRIGGERS.map(t => (
            <Pill key={t} label={t} active={triggers.includes(t)} onPress={() => toggle(t)} />
          ))}
        </View>
      </View>

      <View style={{height: m.h(0.035)}} />

      <View style={[styles.section, {height: m.h(0.15)}]}>
        <Text style={[T.label, {color: colors.muted}]}>Mood</Text>
        <View style={styles.moodRow}>
          {MOODS.map(n => (
            <Pressable
              key={n}
              onPress={() => setMood(n)}
              accessibilityRole="button"
              accessibilityLabel={MOOD_LABELS[n]}
              accessibilityState={{selected: n === mood}}
              style={styles.moodHit}>
              <Mood value={n} size={moodSize} active={n === mood} />
              <Text
                style={[
                  T.caption,
                  styles.moodLabel,
                  {color: n === mood ? colors.ink : colors.frame},
                ]}>
                {MOOD_LABELS[n]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ---- THE ONE FLEX GAP ---- */}
      <View style={styles.flexGap} />

      <Button label={todayEntry ? 'Update' : 'Save'} onPress={save} />
      <View style={{height: m.h(0.03)}} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {flexGrow: 1},
  headerBand: {justifyContent: 'flex-end'},
  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'},

  section: {justifyContent: 'space-evenly'},

  cravingRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  cravingHit: {flex: 1, paddingVertical: 10},
  cravingBar: {borderRadius: 10},
  cravingOn: {backgroundColor: colors.ink},
  cravingOff: {backgroundColor: colors.border},
  cravingNum: {fontWeight: '500', marginLeft: 8},

  pills: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},

  moodRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'},
  moodHit: {alignItems: 'center', flex: 1},
  moodLabel: {marginTop: 6},

  flexGap: {flex: 1},
});
