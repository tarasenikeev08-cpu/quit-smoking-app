import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import HomeScreen from '@/screens/home/HomeScreen';
import RankScreen from '@/screens/rank/RankScreen';
import CollectionScreen from '@/screens/collection/CollectionScreen';
import JournalNavigator from './JournalNavigator';
import TabBar from './TabBar';
import type {TabParamList} from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      tabBar={props => <TabBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Journal" component={JournalNavigator} />
      <Tab.Screen name="Rank" component={RankScreen} />
      <Tab.Screen name="Collection" component={CollectionScreen} />
    </Tab.Navigator>
  );
}
