import {Platform} from 'react-native';

/**
 * Native-only capabilities, stubbed so the app runs identically on web.
 *
 * - haptics: no-op today. TODO(native): wire a real lib (e.g.
 *   react-native-haptic-feedback) behind this call; it already guards web.
 * - home-screen widget: the medium widget in the design reference is a NATIVE
 *   artefact (iOS WidgetKit / Android App Widget). It cannot exist in a browser
 *   and is out of scope for the web target — see WIDGET_SUPPORTED.
 */

export const isWeb = Platform.OS === 'web';

/** Fire a light haptic tap. No-op on web and until a native lib is wired. */
export function haptic(_kind: 'light' | 'success' | 'warning' = 'light'): void {
  if (isWeb) return;
  // TODO(native): trigger real haptic feedback here.
}

/** The home-screen widget only exists on native platforms. */
export const WIDGET_SUPPORTED = !isWeb;
