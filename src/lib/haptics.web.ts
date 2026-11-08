export type HapticKind = 'tick' | 'light' | 'medium' | 'success' | 'warning';

/**
 * Web has no haptic API worth using (navigator.vibrate is unsupported on iOS
 * Safari and feels wrong on desktop), so the whole interaction degrades to
 * visual-only. Same signature as haptics.ts so callers need no platform check.
 */
export function haptic(_kind: HapticKind = 'light'): void {}

export const HAPTICS_SUPPORTED = false;
