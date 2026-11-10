import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import type {LegalDocId} from '@/legal';

const LINKS: {doc: LegalDocId; label: string}[] = [
  {doc: 'terms', label: 'Terms'},
  {doc: 'privacy', label: 'Privacy'},
  {doc: 'medical', label: 'Medical disclaimer'},
];

/** "Terms · Privacy · Medical disclaimer" — for onboarding and the paywall. */
export default function LegalLinks({dark = false}: {dark?: boolean}) {
  const m = useMetrics();
  const nav = useNavigation<any>();
  const color = dark ? colors.mutedOnInk : colors.muted;
  return (
    <View style={styles.row}>
      {LINKS.map((l, i) => (
        <React.Fragment key={l.doc}>
          {i > 0 && <Text style={[m.type.caption, {color}]}> · </Text>}
          <Pressable
            onPress={() => nav.navigate('Legal', {doc: l.doc})}
            hitSlop={8}
            accessibilityRole="link">
            <Text style={[m.type.caption, styles.link, {color}]}>{l.label}</Text>
          </Pressable>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap'},
  link: {textDecorationLine: 'underline'},
});
