import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HookScreen from '@/screens/onboarding/HookScreen';
import MathsScreen from '@/screens/onboarding/MathsScreen';
import PaywallScreen from '@/screens/onboarding/PaywallScreen';
import type {OnboardingParamList} from './types';

const Stack = createNativeStackNavigator<OnboardingParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Hook" component={HookScreen} />
      <Stack.Screen name="Maths" component={MathsScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}
