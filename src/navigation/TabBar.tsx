import React from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Icon, {IconName} from '@/components/Icon';
import {colors} from '@/theme';

const ICONS: Record<string, IconName> = {
  Home: 'circle',
  Journal: 'notebook',
  Rank: 'trophy',
  Collection: 'box',
};

export default function TabBar({state, navigation}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, {paddingBottom: Math.max(insets.bottom, 12)}]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <Pressable key={route.key} style={styles.tab} onPress={onPress} hitSlop={8}>
            <Icon
              name={ICONS[route.name] ?? 'circle'}
              size={20}
              color={focused ? colors.ink : '#B7B5AC'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    backgroundColor: colors.paper,
  },
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
