import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import {Button, Muted} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import type {OnboardingParamList} from '@/navigation/types';

export default function HookScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  const m = useMetrics();
  return (
    <Screen>
      <View style={[styles.wrap, {paddingHorizontal: m.gutter}]}>
        <View style={[styles.hero, {height: m.band.companion, marginTop: m.band.header}]}>
          <Flame size={90} layers={3} />
        </View>
        <Text style={[m.type.h1, styles.title, {color: colors.ink}]}>Keep the{'\n'}streak alive.</Text>
        <Muted style={[m.type.body, styles.sub]}>One hold a day. A streak that’s yours to protect.</Muted>
        <View style={styles.spacer} />
        <Button label="Start" onPress={() => nav.navigate('Maths')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, paddingBottom: 24},
  hero: {alignItems: 'center', justifyContent: 'center'},
  title: {textAlign: 'center'},
  sub: {textAlign: 'center', marginTop: 12, paddingHorizontal: 24},
  // THE ONE FLEX GAP — Start anchored to the bottom
  spacer: {flex: 1},
});
