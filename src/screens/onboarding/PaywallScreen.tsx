import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';

import Flame from '@/components/Flame';
import {colors, radius} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {getOffering, purchase, restore, MockPlan} from '@/services/purchases';

export default function PaywallScreen() {
  const nav = useNavigation<any>();
  const onboarded = useStore(s => s.onboarded);
  const m = useMetrics();
  const T = m.type;
  const finishOnboarding = useStore(s => s.finishOnboarding);

  const [plan, setPlan] = useState<MockPlan | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getOffering().then(setPlan);
  }, []);

  const proceed = () => {
    if (onboarded) nav.goBack();
    else finishOnboarding();
  };

  const onClaim = async () => {
    if (!plan) return;
    setBusy(true);
    await purchase(plan.id); // mock: flips isPremium in the store
    setBusy(false);
    proceed();
  };

  const onRestore = async () => {
    setBusy(true);
    await restore();
    setBusy(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.wrap, {paddingHorizontal: m.gutter, paddingTop: m.band.header}]}>
        <View style={styles.flameRow}>
          <Text style={[T.h1, {color: colors.paper}]}>0</Text>
          <Flame size={24} />
        </View>
        <Text style={[T.h2, styles.headline, {color: colors.paper}]}>Protect your streak from day one.</Text>

        <View style={styles.planCard}>
          <View style={styles.badge}>
            <Text style={[T.caption, styles.badgeTxt, {color: colors.ink}]}>{plan ? plan.discountLabel : '…'}</Text>
          </View>
          <View>
            <Text style={[T.body, {fontWeight: "500", color: colors.paper}]}>{plan?.title ?? 'First month'}</Text>
            <Text style={[T.caption, {color: colors.muted, marginTop: 4}]}>{plan?.subtitle ?? 'then $5 / month'}</Text>
          </View>
          <View style={styles.priceRow}>
            {plan?.strikePrice ? (
              <Text style={[T.body, styles.strike, {color: colors.mutedOnInk}]}>{plan.strikePrice}</Text>
            ) : null}
            <Text style={[T.statValue, styles.price, {color: colors.paper}]}>{plan?.price ?? '$3'}</Text>
          </View>
        </View>
        <Text style={[T.caption, styles.finePrint, {color: colors.mutedOnInk}]}>Less than one pack. Cancel anytime.</Text>

        <View style={styles.spacer} />

        <Pressable style={[styles.cta, {height: m.controls.primary.height, borderRadius: m.controls.primary.radius}]} onPress={onClaim} disabled={busy || !plan}>
          {busy ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <Text style={[T.button, {color: colors.ink}]}>{plan?.ctaLabel ?? 'Claim 40% off'}</Text>
          )}
        </Pressable>

        <View style={styles.footerLinks}>
          <Pressable onPress={onRestore} hitSlop={10}>
            <Text style={[T.caption, {color: colors.mutedOnInk}]}>Restore</Text>
          </Pressable>
          <Pressable onPress={proceed} hitSlop={10}>
            <Text style={[T.caption, {color: colors.mutedOnInk}]}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.ink},
  wrap: {flex: 1, paddingBottom: 16},
  flameRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
  headline: {textAlign: 'center', marginTop: 12},
  planCard: {
    marginTop: 24,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: radius.cardSm,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeTxt: {fontWeight: '600', letterSpacing: 1},
  priceRow: {flexDirection: 'row', alignItems: 'center'},
  strike: {textDecorationLine: 'line-through'},
  price: {marginLeft: 8},
  finePrint: {textAlign: 'center', marginTop: 12},
  // THE ONE FLEX GAP — CTA anchored to the bottom
  spacer: {flex: 1},
  cta: {backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center'},
  footerLinks: {flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 20},
});
