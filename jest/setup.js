/**
 * Jest setup — registers the native-module mocks the App's native build pulls
 * in (gesture-handler, reanimated + worklets, haptics), so the smoke test can
 * render <App /> in the node test environment.
 */

// react-native-gesture-handler ships its own Jest mock for the native module.
require('react-native-gesture-handler/jestSetup');

// AsyncStorage: use its provided in-memory mock for the persisted store.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Reanimated 4 + worklets: use the library's own mock so shared values,
// worklets and hooks resolve without the UI runtime.
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// Native haptics module has no binary under Jest; the real file is only loaded
// on native, but mock it defensively in case a test imports it directly.
jest.mock('react-native-haptic-feedback', () => ({
  __esModule: true,
  default: {trigger: jest.fn()},
  HapticFeedbackTypes: {
    selection: 'selection',
    impactLight: 'impactLight',
    impactMedium: 'impactMedium',
    notificationSuccess: 'notificationSuccess',
    notificationWarning: 'notificationWarning',
  },
}));
