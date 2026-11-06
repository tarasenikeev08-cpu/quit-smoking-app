import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';

import Flame from '@/components/Flame';
import {colors, controls, gutter, radius, spacing, type as T} from '@/theme';
import {useStore} from '@/store';
import {getOffering, purchase, restore, MockPlan} from '@/services/purchases';

export default function PaywallScreen() {
  const nav = useNavigation<any>();
  const onboarded = useStore(s => s.onboarded);
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
      <View style={styles.wrap}>
        <View style={styles.flameRow}>
          <Text style={styles.zero}>0</Text>
          <Flame size={24} />
        </View>
        <Text style={styles.headline}>Protect your streak from day one.</Text>

        <View style={styles.planCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{plan ? plan.discountLabel : '…'}</Text>
          </View>
          <View>
            <Text style={styles.planName}>{plan?.title ?? 'First month'}</Text>
            <Text style={styles.planSub}>{plan?.subtitle ?? 'then $5 / month'}</Text>
          </View>
          <View style={styles.priceRow}>
            {plan?.strikePrice ? (
              <Text style={styles.strike}>{plan.strikePrice}</Text>
            ) : null}
            <Text style={styles.price}>{plan?.price ?? '$3'}</Text>
          </View>
        </View>
        <Text style={styles.finePrint}>Less than one pack. Cancel anytime.</Text>

        <View style={styles.spacer} />

        <Pressable style={styles.cta} onPress={onClaim} disabled={busy || !plan}>
          {busy ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <Text style={styles.ctaTxt}>{plan?.ctaLabel ?? 'Claim 40% off'}</Text>
          )}
        </Pressable>

        <View style={styles.footerLinks}>
          <Pressable onPress={onRestore} hitSlop={10}>
            <Text style={styles.link}>Restore</Text>
          </Pressable>
          <Pressable onPress={proceed} hitSlop={10}>
            <Text style={styles.link}>Maybe later</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.ink},
  wrap: {flex: 1, paddingHorizontal: gutter, paddingTop: spacing.xxl, paddingBottom: spacing.lg},
  flameRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm},
  zero: {...T.h1, color: colors.paper},
  headline: {
    ...T.h2,
    textAlign: 'center',
    color: colors.paper,
    marginTop: spacing.md,
    lineHeight: 28,
  },
  planCard: {
    marginTop: spacing.xxl,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: radius.cardSm,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -10,
    left: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: controls.chip.radius,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeTxt: {color: colors.ink, fontSize: 11, fontWeight: '600', letterSpacing: 1},
  planName: {...T.body, color: colors.paper, fontWeight: '500'},
  planSub: {...T.caption, color: colors.muted, marginTop: spacing.xs},
  priceRow: {flexDirection: 'row', alignItems: 'center'},
  strike: {...T.body, color: colors.mutedOnInk, textDecorationLine: 'line-through'},
  price: {...T.statValue, color: colors.paper, marginLeft: spacing.sm},
  finePrint: {...T.caption, color: colors.mutedOnInk, textAlign: 'center', marginTop: spacing.md},
  spacer: {flex: 1},
  cta: {
    backgroundColor: colors.paper,
    height: controls.primary.height,
    borderRadius: controls.primary.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTxt: {...T.button, color: colors.ink},
  footerLinks: {flexDirection: 'row', justifyContent: 'center', gap: spacing.xxxl, marginTop: spacing.xl},
  link: {...T.caption, color: colors.mutedOnInk},
});
