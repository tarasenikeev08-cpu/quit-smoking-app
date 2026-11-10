import React from 'react';
import {View, StyleSheet} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HookScreen from '@/screens/onboarding/HookScreen';
import QuittingScreen from '@/screens/onboarding/QuittingScreen';
import AmountsScreen from '@/screens/onboarding/AmountsScreen';
import QuitDateScreen from '@/screens/onboarding/QuitDateScreen';
import SavingsScreen from '@/screens/onboarding/SavingsScreen';
import PaywallScreen from '@/screens/onboarding/PaywallScreen';
import {OnboardingChrome, OnboardingFlowProvider, StepTransition} from '@/screens/onboarding/flow';
import {colors} from '@/theme';
import type {OnboardingParamList} from './types';

const Stack = createNativeStackNavigator<OnboardingParamList>();

/**
 * hook -> what you're quitting -> amounts -> quit date -> savings -> paywall.
 *
 * The chrome (progress + companion) sits ABOVE the stack so it persists
 * between steps instead of re-mounting with each screen; every screen is
 * wrapped in StepTransition via `screenLayout`.
 */
export default function OnboardingNavigator() {
  return (
    <OnboardingFlowProvider>
      <View style={styles.root}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            // native: a consistent platform slide; web transitions are in StepTransition
            animation: 'slide_from_right',
            contentStyle: {backgroundColor: colors.paper},
          }}
          screenLayout={props => <StepTransition {...props} />}
        >
          <Stack.Screen name="Hook" component={HookScreen} />
          <Stack.Screen name="Quitting" component={QuittingScreen} />
          <Stack.Screen name="Amounts" component={AmountsScreen} />
          <Stack.Screen name="QuitDate" component={QuitDateScreen} />
          <Stack.Screen name="Savings" component={SavingsScreen} />
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        </Stack.Navigator>
        <OnboardingChrome />
      </View>
    </OnboardingFlowProvider>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.paper},
});
