import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {colors, radius} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {HABITS, HABIT_TYPES, HabitType} from '@/lib/savings';
import type {OnboardingParamList} from '@/navigation/types';
import {OnboardingStep} from './flow';

const DETAIL: Record<HabitType, string> = {
  cigarettes: 'Packs',
  rolling: 'Pouches and papers',
  vape: 'Pods or cartridges',
};

/**
 * STEP 1 — WHAT YOU'RE QUITTING.
 * frame: header 6.5 · companion 15 · headline 11 · sub 5 ·
 * gap 3 · three options 10.5 each, 2 between · [FLEX] · button 6.2 · bottom 3.5
 */
export default function QuittingScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  const m = useMetrics();
  const T = m.type;
  const type = useStore(s => s.habit.type);
  const setHabitType = useStore(s => s.setHabitType);

  return (
    <OnboardingStep
      headline="What are you quitting?"
      sub="It sets what Ember counts for you."
      cta="Continue"
      onNext={() => nav.navigate('Amounts')}
    >
      <View style={{height: m.h(0.03)}} />
      <View accessibilityRole="radiogroup">
        {HABIT_TYPES.map((t, i) => {
          const selected = t === type;
          return (
            <Pressable
              key={t}
              onPress={() => setHabitType(t)}
              accessibilityRole="radio"
              accessibilityState={{checked: selected}}
              accessibilityLabel={HABITS[t].label}
              style={({pressed}) => [
                styles.option,
                {height: m.h(0.105), marginTop: i === 0 ? 0 : m.h(0.02)},
                selected ? styles.optionOn : styles.optionOff,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.optionText}>
                <Text style={[T.body, styles.optionLabel]}>{HABITS[t].label}</Text>
                <Text style={[T.caption, styles.optionDetail]}>{DETAIL[t]}</Text>
              </View>
              <View style={[styles.radio, selected && styles.radioOn]}>
                {selected && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.card,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
  },
  optionOn: {borderColor: colors.ink},
  optionOff: {borderColor: colors.border},
  pressed: {opacity: 0.85},
  optionText: {flex: 1},
  optionLabel: {color: colors.ink, fontWeight: '500'},
  optionDetail: {color: colors.muted, marginTop: 2},
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: {borderColor: colors.ink, backgroundColor: colors.ink},
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.paper,
  },
});
