import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable, ActivityIndicator, StatusBar} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';

import Flame from '@/components/Flame';
import {colors, radius} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {getOffering, purchase, restore, MockPlan} from '@/services/purchases';

/**
 * PAYWALL, per Ember_Proportions.md.
 * top 6.5% · flame hero 24% · headline 14% · gap 4% · plan card 15% ·
 * fine print 5.5% · [THE ONE FLEX GAP] · CTA 6.2% · links 6% · bottom 3%
 */
export default function PaywallScreen() {
  const nav = useNavigation<any>();
  const onboarded = useStore(s => s.onboarded);
  const m = useMetrics();
  const T = m.type;
  const finishOnboarding = useStore(s => s.finishOnboarding);

  const [plan, setPlan] = useState<MockPlan | null>(null);
  const [busy, setBusy] = useState(false);
  /** one-line status shown in place of the fine print (errors, restore result) */
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getOffering()
      .then(p => alive && setPlan(p))
      .catch(() => alive && setNote('Couldn’t load the offer. You can continue for now.'));
    return () => {
      alive = false;
    };
  }, []);

  const proceed = () => {
    if (onboarded) nav.goBack();
    else finishOnboarding();
  };

  // try/finally so a failed or cancelled purchase can never leave the spinner
  // stuck — the mocks don't throw, but the real provider will.
  const onClaim = async () => {
    if (!plan || busy) return;
    setBusy(true);
    setNote(null);
    try {
      const ok = await purchase(plan.id); // mock: flips isPremium in the store
      if (ok) proceed();
      else setNote('Purchase didn’t go through. Nothing was charged.');
    } catch {
      setNote('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const restored = await restore();
      if (restored) proceed();
      else setNote('No previous purchase found on this account.');
    } catch {
      setNote('Couldn’t reach the store. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.wrap, {paddingHorizontal: m.gutter, paddingTop: m.band.header}]}>
        <View style={[styles.flameRow, {height: m.h(0.24)}]}>
          <Text style={[T.dayCount, {color: colors.paper}]}>0</Text>
          <Flame size={Math.round(m.h(0.12) / 1.25)} />
        </View>

        <View style={[styles.headlineBand, {height: m.h(0.14)}]}>
          <Text style={[T.h2, styles.headline, {color: colors.paper, lineHeight: Math.round(T.h2.fontSize * 1.3)}]}>
            Protect your streak from day one.
          </Text>
        </View>

        <View style={{height: m.h(0.04)}} />

        <View style={[styles.planCard, {height: m.h(0.15)}]}>
          <View style={styles.badge}>
            <Text style={[T.caption, styles.badgeTxt, {color: colors.ink}]}>
              {plan ? plan.discountLabel : '…'}
            </Text>
          </View>
          <View style={styles.planInfo}>
            <Text style={[T.body, {fontWeight: '500', color: colors.paper}]}>
              {plan?.title ?? 'First month'}
            </Text>
            <Text style={[T.caption, {color: colors.muted, marginTop: 4}]}>
              {plan?.subtitle ?? 'then $5 / month'}
            </Text>
          </View>
          <View style={styles.priceRow}>
            {plan?.strikePrice ? (
              <Text style={[T.body, styles.strike, {color: colors.mutedOnInk}]}>{plan.strikePrice}</Text>
            ) : null}
            <Text style={[T.statValue, styles.price, {color: colors.paper}]}>{plan?.price ?? '$3'}</Text>
          </View>
        </View>

        <View style={[styles.fineBand, {height: m.h(0.055)}]}>
          <Text
            accessibilityLiveRegion="polite"
            style={[T.caption, styles.finePrint, {color: note ? colors.paper : colors.mutedOnInk}]}>
            {note ?? 'Less than one pack. Cancel anytime.'}
          </Text>
        </View>

        {/* ---- THE ONE FLEX GAP ---- */}
        <View style={styles.flexGap} />

        <Pressable
          accessibilityRole="button"
          style={[styles.cta, {height: m.controls.primary.height, borderRadius: m.controls.primary.radius}]}
          onPress={onClaim}
          disabled={busy || !plan}>
          {busy ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <Text style={[T.button, {color: colors.ink}]}>{plan?.ctaLabel ?? 'Claim 40% off'}</Text>
          )}
        </Pressable>

        <View style={[styles.footerLinks, {height: m.h(0.06)}]}>
          <Pressable onPress={onRestore} hitSlop={10} disabled={busy} accessibilityRole="button">
            <Text style={[T.caption, {color: colors.mutedOnInk}]}>Restore</Text>
          </Pressable>
          <Pressable onPress={proceed} hitSlop={10} disabled={busy} accessibilityRole="button">
            <Text style={[T.caption, {color: colors.mutedOnInk}]}>Maybe later</Text>
          </Pressable>
        </View>
        <View style={{height: m.h(0.03)}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: colors.ink},
  wrap: {flex: 1},
  flameRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10},
  headlineBand: {justifyContent: 'center'},
  headline: {textAlign: 'center'},

  planCard: {
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: radius.card,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {flex: 1},
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

  fineBand: {justifyContent: 'center'},
  finePrint: {textAlign: 'center'},

  flexGap: {flex: 1},
  cta: {backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center'},
  footerLinks: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 32},
});
