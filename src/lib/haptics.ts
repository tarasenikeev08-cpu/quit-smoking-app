import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

export type HapticKind = 'tick' | 'light' | 'medium' | 'success' | 'warning';

const MAP: Record<HapticKind, HapticFeedbackTypes> = {
  tick: HapticFeedbackTypes.selection,
  light: HapticFeedbackTypes.impactLight,
  medium: HapticFeedbackTypes.impactMedium,
  success: HapticFeedbackTypes.notificationSuccess,
  warning: HapticFeedbackTypes.notificationWarning,
};

const OPTIONS = {
  enableVibrateFallback: false,
  ignoreAndroidSystemSettings: false,
};

/**
 * Fire a haptic. Native only — see haptics.web.ts for the browser no-op.
 * Never throws: a device without a taptic engine just does nothing.
 */
export function haptic(kind: HapticKind = 'light'): void {
  try {
    ReactNativeHapticFeedback.trigger(MAP[kind], OPTIONS);
  } catch {
    // no haptics on this device — not worth surfacing
  }
}

export const HAPTICS_SUPPORTED = true;
