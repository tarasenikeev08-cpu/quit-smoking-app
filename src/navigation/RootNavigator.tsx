import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {NavigationContainer, DefaultTheme, Theme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OnboardingNavigator from './OnboardingNavigator';
import TabNavigator from './TabNavigator';
import SlipScreen from '@/screens/slip/SlipScreen';
import PaywallScreen from '@/screens/onboarding/PaywallScreen';
import {useStore} from '@/store';
import {colors} from '@/theme';
import type {RootParamList} from './types';

const Stack = createNativeStackNavigator<RootParamList>();

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {...DefaultTheme.colors, background: colors.paper, card: colors.paper},
};

export default function RootNavigator() {
  const hydrated = useStore(s => s.hydrated);
  const onboarded = useStore(s => s.onboarded);

  if (!hydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.ink} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Group>
            <Stack.Screen name="Tabs" component={TabNavigator} />
            <Stack.Screen
              name="Slip"
              component={SlipScreen}
              options={{presentation: 'modal'}}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{presentation: 'modal'}}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper},
});
