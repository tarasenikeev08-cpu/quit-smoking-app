/**
 * Ember — quit-smoking streak tracker.
 * Design reference: Ember_Design_Reference.html (warm paper, amber flame).
 *
 * NOTE: Backend (Supabase) and payments (RevenueCat) are intentionally STUBBED.
 * See src/services/data.ts and src/services/purchases.ts. No network calls or
 * SDK initialisation happen here yet.
 */
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import RootNavigator from '@/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
