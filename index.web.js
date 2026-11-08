/**
 * Web entry (react-native-web via webpack). Native uses index.js.
 */
import {AppRegistry} from 'react-native';
import {isWorkletFunction} from 'react-native-worklets';
import App from './App';
import {name as appName} from './app.json';

// Development guard: is the worklets Babel plugin actually running?
//
// webpack reads webpack.config.js once, at startup. A dev server started
// before the plugin was added keeps compiling without it — and Reanimated
// then fails on the Home screen. Every animated style declares explicit
// dependencies, so the app still works in that state, but say clearly what's
// wrong instead of leaving a confusing stack trace.
if (process.env.NODE_ENV !== 'production') {
  const probe = () => {
    'worklet';
    return 0;
  };
  if (!isWorkletFunction(probe)) {
    console.warn(
      '[Ember] The Reanimated Babel plugin is not active in this build.\n' +
        'Stop the dev server (Ctrl+C) and run `npm run web` again — webpack ' +
        'only reads webpack.config.js when it starts. The app keeps working ' +
        'meanwhile; restart to build with the plugin as intended.',
    );
  }
}

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
