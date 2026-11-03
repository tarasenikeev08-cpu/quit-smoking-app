import React from 'react';
import {View} from 'react-native';

/**
 * Web: react-native-gesture-handler's module build is native-only, and the
 * navigators here don't need it, so the root is a plain flex View. Native uses
 * GestureRoot.tsx with the real GestureHandlerRootView.
 */
export default function GestureRoot({children}: {children: React.ReactNode}) {
  return <View style={{flex: 1}}>{children}</View>;
}
