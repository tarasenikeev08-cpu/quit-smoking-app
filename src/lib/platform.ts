import {Platform} from 'react-native';

export {haptic, HAPTICS_SUPPORTED} from './haptics';
export type {HapticKind} from './haptics';

/**
 * Native-only capabilities, stubbed so the app runs identically on web.
 *
 * - haptics: real on native (react-native-haptic-feedback), a no-op on web.
 *   Resolution is by filename — haptics.ts vs haptics.web.ts — so the web
 *   bundle never pulls the native module in.
 * - home-screen widget: the medium widget in the design reference is a NATIVE
 *   artefact (iOS WidgetKit / Android App Widget). It cannot exist in a browser
 *   and is out of scope for the web target — see WIDGET_SUPPORTED.
 */

export const isWeb = Platform.OS === 'web';

/** The home-screen widget only exists on native platforms. */
export const WIDGET_SUPPORTED = !isWeb;
