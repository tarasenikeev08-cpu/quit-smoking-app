import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'react-native';

import Flame from '@/components/Flame';
import {colors, spacing} from '@/theme';
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
  wrap: {flex: 1, paddingHorizontal: spacing.lg, paddingTop: 22, paddingBottom: spacing.lg},
  flameRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7},
  zero: {fontSize: 34, fontWeight: '500', color: colors.paper},
  headline: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    color: colors.paper,
    marginTop: 8,
    lineHeight: 18,
  },
  planCard: {
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -9,
    left: 14,
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeTxt: {color: colors.ink, fontSize: 9, fontWeight: '700', letterSpacing: 1},
  planName: {fontSize: 13, color: colors.paper, fontWeight: '500'},
  planSub: {fontSize: 10, color: colors.muted, marginTop: 2},
  priceRow: {flexDirection: 'row', alignItems: 'center'},
  strike: {fontSize: 13, color: colors.mutedOnInk, textDecorationLine: 'line-through'},
  price: {fontSize: 20, color: colors.paper, fontWeight: '500', marginLeft: 4},
  finePrint: {fontSize: 10, color: colors.mutedOnInk, textAlign: 'center', marginTop: 10},
  spacer: {flex: 1},
  cta: {
    backgroundColor: colors.paper,
    borderRadius: 40,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaTxt: {
    color: colors.ink,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  footerLinks: {flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: 16},
  link: {color: colors.mutedOnInk, fontSize: 12},
});
