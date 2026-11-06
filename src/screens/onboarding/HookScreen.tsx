import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import {Button, Muted} from '@/components/ui';
import {colors, gutter, spacing, type as T} from '@/theme';
import type {OnboardingParamList} from '@/navigation/types';

export default function HookScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.hero}>
          <Flame size={90} layers={3} />
        </View>
        <Text style={styles.title}>Keep the{'\n'}streak alive.</Text>
        <Muted style={styles.sub}>One hold a day. A streak that’s yours to protect.</Muted>
        <View style={styles.spacer} />
        <Button label="Start" onPress={() => nav.navigate('Maths')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingHorizontal: gutter, paddingBottom: spacing.xxl},
  hero: {alignItems: 'center', paddingTop: spacing.huge, paddingBottom: spacing.xxl},
  title: {...T.h1, textAlign: 'center', lineHeight: 40, color: colors.ink},
  sub: {
    ...T.body,
    textAlign: 'center',
    color: colors.muted,
    marginTop: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  spacer: {flex: 1},
});
