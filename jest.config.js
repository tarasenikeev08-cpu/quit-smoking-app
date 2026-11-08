module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest/setup.js'],
  // Reanimated 4 / worklets resolve their UI-runtime entry points via .native
  // files that need the native binary. This resolver (shipped by the library)
  // steers them to their Jest-safe web builds instead.
  resolver: 'react-native-reanimated/jest/resolver.js',
  // RN libraries ship untranspiled source; let babel-jest transform them
  // instead of treating them as plain node_modules.
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      [
        '@react-native',
        'react-native',
        '@react-navigation',
        'react-native-gesture-handler',
        'react-native-reanimated',
        'react-native-worklets',
        'react-native-screens',
        'react-native-safe-area-context',
        'react-native-svg',
      ].join('|') +
      ')/)',
  ],
};
