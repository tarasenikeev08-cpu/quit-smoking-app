import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Screen from '@/components/Screen';
import Flame from '@/components/Flame';
import {Button} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import type {OnboardingParamList} from '@/navigation/types';

/**
 * ONBOARDING — HOOK, per Ember_Proportions.md.
 * top 6.5% · flame hero 40% · gap 3% · title 15% · gap 1.5% · sub 8% ·
 * [THE ONE FLEX GAP] · Start 6.2% · bottom 3.5%
 */
export default function HookScreen() {
  const nav = useNavigation<NativeStackNavigationProp<OnboardingParamList>>();
  const m = useMetrics();
  const T = m.type;
  // the flame is the hero: it owns its band the way the companion owns Home's
  const flameH = m.h(0.33);

  return (
    <Screen>
      <View style={[styles.wrap, {paddingHorizontal: m.gutter, paddingTop: m.band.header}]}>
        <View style={[styles.hero, {height: m.h(0.4)}]}>
          <Flame size={Math.round(flameH / 1.25)} layers={3} />
        </View>

        <View style={{height: m.h(0.03)}} />

        <View style={[styles.titleBand, {height: m.h(0.15)}]}>
          <Text style={[T.h1, styles.title, {color: colors.ink, lineHeight: Math.round(T.h1.fontSize * 1.15)}]}>
            Keep the{'\n'}streak alive.
          </Text>
        </View>

        <View style={{height: m.h(0.015)}} />

        <View style={[styles.subBand, {height: m.h(0.08)}]}>
          <Text style={[T.body, styles.sub, {color: colors.muted}]}>
            One hold a day. A streak that’s yours to protect.
          </Text>
        </View>

        {/* ---- THE ONE FLEX GAP ---- */}
        <View style={styles.flexGap} />

        <Button label="Start" onPress={() => nav.navigate('Quitting')} />
        <View style={{height: m.h(0.035)}} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1},
  hero: {alignItems: 'center', justifyContent: 'center'},
  titleBand: {justifyContent: 'center'},
  title: {textAlign: 'center'},
  subBand: {justifyContent: 'flex-start'},
  sub: {textAlign: 'center', paddingHorizontal: 24},
  flexGap: {flex: 1},
});
