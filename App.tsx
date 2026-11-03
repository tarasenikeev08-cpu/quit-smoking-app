/**
 * Ember — quit-smoking streak tracker.
 * Design reference: Ember_Design_Reference.html (warm paper, amber flame).
 *
 * NOTE: Backend (Supabase) and payments (RevenueCat) are intentionally STUBBED.
 * See src/services/data.ts and src/services/purchases.ts. No network calls or
 * SDK initialisation happen here yet.
 */
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import GestureRoot from '@/components/GestureRoot';
import RootNavigator from '@/navigation/RootNavigator';

export default function App() {
  return (
    <GestureRoot>
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </GestureRoot>
  );
}
