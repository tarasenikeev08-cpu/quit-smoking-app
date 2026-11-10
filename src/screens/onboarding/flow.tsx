import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {AppState, Platform, Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import Screen from '@/components/Screen';
import Icon from '@/components/Icon';
import CompanionWake from '@/components/CompanionWake';
import {Button} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {EASE_OUT, ONBOARDING_HANDOFF_WAKE, SPRING_HOP, SPRING_SOFT} from '@/anim/config';
import {WakeProvider, useWakeEngine} from '@/anim/wake';
import type {OnboardingParamList} from '@/navigation/types';

/* ============================================================================
 * The onboarding flow, as ONE set rather than five separately built screens.
 *
 *   Hook  ->  Quitting -> Amounts -> QuitDate -> Savings  ->  Paywall
 *             \_______________ input steps ______________/
 *
 * Shared by every input step:
 *   - OnboardingChrome: a header that persists ACROSS screens (it lives above
 *     the stack, so it never re-mounts): segmented progress + the companion,
 *     asleep at first and waking a little more with each step.
 *   - OnboardingStep: the frame each step renders into — same gutters, same
 *     H1 headline band, one flex gap, same button and bottom margin.
 *   - StepTransition: screen changes fade through instead of hard-cutting.
 *
 * Bands (Ember_Proportions.md, % of screen height):
 *   header 6.5 · companion 15 · headline 11 · sub 5 · [content] ·
 *   [THE ONE FLEX GAP] · button 6.2 · bottom 3.5
 * ========================================================================== */

export type OnboardingRoute = keyof OnboardingParamList;

/** Input steps in order; their index drives progress and the companion. */
export const INPUT_STEPS: OnboardingRoute[] = ['Quitting', 'Amounts', 'QuitDate', 'Savings'];

/** Full order, for working out whether a screen change is forward or back. */
const ORDER: OnboardingRoute[] = ['Hook', ...INPUT_STEPS, 'Paywall'];

/**
 * How awake the companion is on each step: asleep -> stirring (eyes still
 * shut) -> eyes open -> smiling. The last bit of waking is saved for the
 * hand-off to Home. Each level sits clear of CompanionWake's eye cross-fade
 * (0.3-0.7), so no step shows half-open "ghost" eyes.
 */
const WAKE_AT: Partial<Record<OnboardingRoute, number>> = {
  Quitting: 0.08,
  Amounts: 0.3,
  QuitDate: 0.66,
  Savings: ONBOARDING_HANDOFF_WAKE,
};

/** Bands shared by the chrome and the step frame. */
export const BANDS = {
  header: 0.065,
  companion: 0.15,
  headline: 0.11,
  sub: 0.05,
  bottom: 0.035,
} as const;

type Flow = {
  route: OnboardingRoute;
  /** +1 moving forward, -1 moving back */
  direction: 1 | -1;
  onFocus: (r: OnboardingRoute) => void;
};
const FlowContext = createContext<Flow | null>(null);
const useFlow = () => {
  const f = useContext(FlowContext);
  if (!f) throw new Error('Onboarding flow components need <OnboardingFlowProvider>');
  return f;
};

export function OnboardingFlowProvider({children}: {children: React.ReactNode}) {
  // a fresh onboarding (first launch, or after "delete my data") starts at the hook
  useState(() => {
    lastRoute.current = 'Hook';
    return null;
  });
  const [state, setState] = useState<{
    route: OnboardingRoute;
    direction: 1 | -1;
  }>({
    route: 'Hook',
    direction: 1,
  });
  const value = useMemo<Flow>(
    () => ({
      ...state,
      onFocus: r =>
        setState(prev =>
          prev.route === r
            ? prev
            : {
                route: r,
                direction: ORDER.indexOf(r) >= ORDER.indexOf(prev.route) ? 1 : -1,
              },
        ),
    }),
    [state],
  );
  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

/* ------------------------------ transitions ------------------------------ */

const TRANSITION_MS = 320;
const SHIFT = 22;

/**
 * Used as the stack's `screenLayout`, so it wraps every onboarding screen —
 * the paywall included — without touching the screens themselves.
 *
 * Web: the stack shows the new screen and hides the old one in the same
 * frame (a hard cut, both ways). Each screen now fades in from paper with a
 * short slide in the direction of travel — a fade-through.
 * Native: the platform stack already animates, so this only reports focus.
 */
export function StepTransition({
  route,
  navigation,
  children,
}: {
  route: {name: string};
  navigation: {
    addListener: (e: 'focus', cb: () => void) => () => void;
    isFocused: () => boolean;
  };
  children: React.ReactNode;
}) {
  const flow = useFlow();
  const name = route.name as OnboardingRoute;
  const progress = useSharedValue(Platform.OS === 'web' ? 0 : 1);
  const from = useSharedValue(SHIFT);

  useEffect(() => {
    const enter = () => {
      flow.onFocus(name);
      if (Platform.OS !== 'web') return;
      // direction is decided by where we came from, read synchronously
      const prev = lastRoute.current;
      const dir = ORDER.indexOf(name) >= ORDER.indexOf(prev) ? 1 : -1;
      lastRoute.current = name;
      from.value = dir * SHIFT;
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: TRANSITION_MS,
        easing: EASE_OUT,
      });
    };
    if (navigation.isFocused()) enter();
    return navigation.addListener('focus', enter);
    // flow.onFocus is stable in behaviour; re-subscribing on each flow change
    // would replay the entrance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, name]);

  const style = useAnimatedStyle(
    () => ({
      opacity: progress.value,
      transform: [{translateX: (1 - progress.value) * from.value}],
    }),
    [progress, from],
  );

  return <Animated.View style={[styles.fill, style]}>{children}</Animated.View>;
}

/** Shared across all StepTransition instances: the last focused route. */
const lastRoute: {current: OnboardingRoute} = {current: 'Hook'};

/* -------------------------------- chrome -------------------------------- */

/**
 * Header that persists above the stack on the input steps: progress segments
 * and the companion. Hidden on the hook (companion-free by design) and the
 * paywall. Non-interactive — touches pass through to the screen beneath.
 */
export function OnboardingChrome() {
  const {route, direction} = useFlow();
  const m = useMetrics();
  const insets = useSafeAreaInsets();
  const equipped = useStore(s => s.equipped);

  const stepIndex = INPUT_STEPS.indexOf(route);
  const shown = stepIndex >= 0;

  // own the foreground state so the companion's idle loops pause when hidden
  const [foreground, setForeground] = useState(AppState.currentState !== 'background');
  useEffect(() => {
    const sub = AppState.addEventListener('change', s => setForeground(s === 'active'));
    return () => sub.remove();
  }, []);

  const engine = useWakeEngine(false, shown && foreground);
  const visible = useSharedValue(0);
  const fill = useSharedValue(0);

  useEffect(() => {
    visible.value = withTiming(shown ? 1 : 0, {
      duration: TRANSITION_MS,
      easing: EASE_OUT,
    });
    if (!shown) return;
    fill.value = withTiming(stepIndex + 1, {duration: 420, easing: EASE_OUT});
    engine.wake.value = withSpring(WAKE_AT[route] ?? 0, SPRING_SOFT);
    // each step forward gives it a small nudge — it notices
    if (direction === 1 && stepIndex > 0) {
      engine.celebrate.value = withSequence(
        withTiming(0.35, {duration: 140, easing: EASE_OUT}),
        withSpring(0, SPRING_HOP),
      );
    }
  }, [route, shown, stepIndex, direction, engine, visible, fill]);

  const wrapStyle = useAnimatedStyle(() => ({opacity: visible.value}), [visible]);

  // the artwork fills only the middle of its box; size up so it owns the band
  const companionSize = Math.round(m.h(BANDS.companion) * 1.12);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.chrome, {top: insets.top, paddingHorizontal: m.gutter}, wrapStyle]}
    >
      <View style={[styles.progressRow, {height: m.h(BANDS.header)}]}>
        <View style={styles.segments} accessibilityElementsHidden>
          {INPUT_STEPS.map((_, i) => (
            <Segment key={i} index={i} fill={fill} />
          ))}
        </View>
      </View>
      <View style={[styles.companionBand, {height: m.h(BANDS.companion)}]}>
        <WakeProvider engine={engine}>
          <CompanionWake id={equipped} size={companionSize} />
        </WakeProvider>
      </View>
    </Animated.View>
  );
}

function Segment({index, fill}: {index: number; fill: ReturnType<typeof useSharedValue<number>>}) {
  const style = useAnimatedStyle(
    () => ({
      transform: [{scaleX: Math.min(1, Math.max(0, fill.value - index))}],
    }),
    [fill, index],
  );
  return (
    <View style={styles.segment}>
      <Animated.View style={[styles.segmentFill, style]} />
    </View>
  );
}

/* ------------------------------- step frame ------------------------------- */

type StepProps = {
  headline: React.ReactNode;
  /** one line under the headline (muted body) */
  sub?: React.ReactNode;
  cta: string;
  onNext: () => void;
  /** content bands, in order */
  children: React.ReactNode;
};

/**
 * The frame every input step renders into. Reserves the persistent chrome's
 * space, places the back button in the header band, and fixes the headline,
 * the one flex gap, the button and the bottom margin so every step lines up.
 */
export function OnboardingStep({headline, sub, cta, onNext, children}: StepProps) {
  const m = useMetrics();
  const T = m.type;
  const nav = useNavigation();

  return (
    <Screen>
      <View style={[styles.wrap, {paddingHorizontal: m.gutter}]}>
        {/* header band — back sits under the persistent progress row */}
        <View style={[styles.header, {height: m.h(BANDS.header)}]}>
          <Pressable
            onPress={() => nav.goBack()}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Icon name="chevronLeft" size={22} color={colors.ink} />
          </Pressable>
        </View>

        {/* companion band — drawn by the persistent chrome above the stack */}
        <View style={{height: m.h(BANDS.companion)}} />

        <View style={[styles.headlineBand, {height: m.h(BANDS.headline)}]}>
          <Text
            accessibilityRole="header"
            style={[T.h1, styles.headline, {lineHeight: Math.round(T.h1.fontSize * 1.12)}]}
          >
            {headline}
          </Text>
        </View>
        <View style={[styles.subBand, {height: m.h(BANDS.sub)}]}>
          {sub ? (
            <Text style={[T.body, styles.sub]} accessibilityLiveRegion="polite">
              {sub}
            </Text>
          ) : null}
        </View>

        {children}

        {/* ---- THE ONE FLEX GAP ---- */}
        <View style={styles.flexGap} />

        <Button label={cta} onPress={onNext} />
        <View style={{height: m.h(BANDS.bottom)}} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  wrap: {flex: 1},
  header: {justifyContent: 'center', alignItems: 'flex-start'},
  headlineBand: {justifyContent: 'flex-end'},
  headline: {color: colors.ink},
  subBand: {justifyContent: 'center'},
  sub: {color: colors.muted},
  flexGap: {flex: 1},

  chrome: {position: 'absolute', left: 0, right: 0, zIndex: 10},
  progressRow: {justifyContent: 'center', alignItems: 'center'},
  segments: {flexDirection: 'row', gap: 6, width: '38%'},
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  segmentFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.ink,
    transformOrigin: 'left',
  } as any,
  companionBand: {alignItems: 'center', justifyContent: 'center'},
});
