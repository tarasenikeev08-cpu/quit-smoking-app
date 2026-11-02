import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import {Button, Muted} from '@/components/ui';
import {colors, spacing} from '@/theme';
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
  wrap: {flex: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xl},
  hero: {alignItems: 'center', paddingTop: 48, paddingBottom: 18},
  title: {
    textAlign: 'center',
    fontSize: 23,
    fontWeight: '500',
    lineHeight: 27,
    color: colors.ink,
  },
  sub: {textAlign: 'center', marginTop: 10, lineHeight: 16, paddingHorizontal: 24},
  spacer: {flex: 1},
});
