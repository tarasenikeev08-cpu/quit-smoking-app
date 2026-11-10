import {Easing} from 'react-native-reanimated';

/**
 * Motion tokens for the wake interaction.
 *
 * Everything here is a spring unless the motion is a literal progress bar.
 * Springs are specified by mass/damping/stiffness so they read the same on
 * native and web.
 */

/** How long the user must hold to wake the companion. */
export const HOLD_DURATION = 1200;

/** Settles with a little overshoot — used when something comes alive. */
export const SPRING_WAKE = {mass: 0.9, damping: 11, stiffness: 150} as const;

/** A bouncier spring for the completion hop. */
export const SPRING_HOP = {mass: 0.7, damping: 8.5, stiffness: 190} as const;

/** No overshoot — used when reversing an abandoned hold. */
export const SPRING_SETTLE = {mass: 0.8, damping: 20, stiffness: 180} as const;

/** Gentle, for the halo and the breathing loop. */
export const SPRING_SOFT = {mass: 1.1, damping: 16, stiffness: 90} as const;

export const EASE_OUT = Easing.out(Easing.cubic);
export const EASE_IN_OUT = Easing.inOut(Easing.quad);
export const EASE_LINEAR = Easing.linear;

/** Breathing loop while dormant — slow, shallow, never distracting. */
export const BREATH_PERIOD = 2600;

/** Sparks that drift up while charging, and burst outward on completion. */
export const EMBER_COUNT = 14;

/**
 * How awake the companion is at the end of onboarding. Home picks up from
 * exactly this level for the hand-off celebration, so it reads as one wake.
 */
export const ONBOARDING_HANDOFF_WAKE = 0.8;
