import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import CheckInScreen from '@/screens/journal/CheckInScreen';
import PatternsScreen from '@/screens/journal/PatternsScreen';
import type {JournalParamList} from './types';

const Stack = createNativeStackNavigator<JournalParamList>();

export default function JournalNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="Patterns" component={PatternsScreen} />
    </Stack.Navigator>
  );
}
