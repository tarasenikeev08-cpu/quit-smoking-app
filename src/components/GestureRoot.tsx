import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

/** Native: real gesture-handler root. (Web uses GestureRoot.web.tsx.) */
export default function GestureRoot({children}: {children: React.ReactNode}) {
  return <GestureHandlerRootView style={{flex: 1}}>{children}</GestureHandlerRootView>;
}
