import React from 'react';
import {View, ScrollView, StyleSheet, ViewStyle, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '@/theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  dark?: boolean;
  contentStyle?: ViewStyle;
};

/** Warm-paper screen shell with safe-area insets. */
export default function Screen({children, scroll, dark, contentStyle}: Props) {
  const bg = dark ? colors.ink : colors.paper;
  const Body = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: bg}]} edges={['top', 'bottom']}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />
      <Body
        style={styles.flex}
        contentContainerStyle={scroll ? [styles.scrollContent, contentStyle] : undefined}>
        {scroll ? children : <View style={[styles.flex, contentStyle]}>{children}</View>}
      </Body>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1},
  flex: {flex: 1},
  scrollContent: {paddingBottom: 32, flexGrow: 1},
});
