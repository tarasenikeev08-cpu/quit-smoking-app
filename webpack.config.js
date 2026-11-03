const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const root = __dirname;

/**
 * React Native Web build via webpack + babel.
 *
 * babel-loader transpiles the app AND the RN libraries (stripping Flow/JSX that
 * esbuild/Vite choke on), and webpack's resolver applies `.web.js` platform
 * resolution to node_modules — the two things that make RN-on-web work.
 */

// RN packages that ship untranspiled source (Flow/TS/JSX) and must go through babel.
const rnPackages = [
  'react-native',
  'react-native-web',
  '@react-native',
  '@react-navigation',
  'react-native-screens',
  'react-native-safe-area-context',
  'react-native-svg',
  '@react-native-async-storage',
].map(p => path.resolve(root, 'node_modules', p));

module.exports = {
  mode: 'development',
  entry: path.resolve(root, 'index.web.js'),
  output: {
    path: path.resolve(root, 'dist-web'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      // Components come from react-native-web (patched with native-only stubs).
      'react-native$': 'react-native-web',
      '@': path.resolve(root, 'src'),
    },
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
  },
  module: {
    rules: [
      // RN libs ship ESM with extensionless relative imports; don't force
      // fully-specified paths (webpack's strict ESM default).
      {test: /\.[cm]?jsx?$/, resolve: {fullySpecified: false}},
      {
        test: /\.[jt]sx?$/,
        // `javascript/auto` stops webpack enforcing strict ESM on files inside
        // RN libs' `type: module` packages, so babel's CommonJS output (and the
        // libs' own CJS files) load correctly.
        type: 'javascript/auto',
        include: [
          path.resolve(root, 'src'),
          path.resolve(root, 'App.tsx'),
          path.resolve(root, 'index.web.js'),
          ...rnPackages,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            configFile: false,
            babelrc: false,
            sourceType: 'unambiguous',
            presets: ['module:@react-native/babel-preset'],
            cacheDirectory: false,
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|ttf|woff2?)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({template: path.resolve(root, 'public/index.html')}),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
  ],
  devServer: {
    port: 5173,
    host: '0.0.0.0',
    historyApiFallback: true,
    static: {directory: path.resolve(root, 'public')},
    client: {overlay: true},
  },
};
