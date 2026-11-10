import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Screen from '@/components/Screen';
import Icon from '@/components/Icon';
import ConfirmDialog from '@/components/ConfirmDialog';
import {Card, Hair} from '@/components/ui';
import {colors} from '@/theme';
import {useMetrics} from '@/theme/metrics';
import {useStore} from '@/store';
import {LEGAL_DOCS} from '@/legal';
import {version} from '../../../package.json';

/**
 * SETTINGS — legal documents, and deleting everything Ember has stored.
 * v1 is local-first with no account, so "delete my data" means erasing the
 * device's copy, which is the only copy.
 */
export default function SettingsScreen() {
  const nav = useNavigation<any>();
  const m = useMetrics();
  const T = m.type;
  const deleteAllData = useStore(s => s.deleteAllData);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    setDeleting(true);
    // Wipes storage and resets the store; the root navigator then swaps to a
    // fresh onboarding on its own, closing this screen.
    await deleteAllData();
  };

  return (
    <Screen scroll contentStyle={{paddingHorizontal: m.gutter, paddingBottom: m.h(0.05)}}>
      <View style={[styles.header, {height: m.band.header}]}>
        <Pressable onPress={() => nav.goBack()} hitSlop={14} accessibilityRole="button" accessibilityLabel="Close">
          <Icon name="close" size={22} color={colors.ink} />
        </Pressable>
      </View>

      <Text accessibilityRole="header" style={[T.h1, styles.title]}>
        Settings
      </Text>

      <Text style={[T.label, styles.section]}>Legal</Text>
      <Card style={styles.card}>
        {LEGAL_DOCS.map((d, i) => (
          <View key={d.id}>
            {i > 0 && <Hair />}
            <Pressable
              onPress={() => nav.navigate('Legal', {doc: d.id})}
              accessibilityRole="button"
              style={({pressed}) => [styles.row, {minHeight: m.controls.primary.height}, pressed && styles.pressed]}>
              <Text style={[T.body, styles.rowText]}>{d.title}</Text>
              <Icon name="chevronRight" size={18} color={colors.muted} />
            </Pressable>
          </View>
        ))}
      </Card>

      <Text style={[T.label, styles.section]}>Your data</Text>
      <Text style={[T.caption, styles.note]}>
        Everything Ember stores stays on this device. Nothing is sent anywhere.
      </Text>
      <Card strong style={[styles.card, {marginTop: 12}]}>
        <Pressable
          onPress={() => setConfirming(true)}
          disabled={deleting}
          accessibilityRole="button"
          accessibilityHint="Permanently erases all of your data"
          style={({pressed}) => [styles.row, {minHeight: m.controls.primary.height}, pressed && styles.pressed]}>
          <View style={styles.flex}>
            <Text style={[T.body, styles.danger]}>Delete my data</Text>
            <Text style={[T.caption, styles.dangerSub]}>
              Permanent. Erases your streak, journal, companions and onboarding answers.
            </Text>
          </View>
        </Pressable>
      </Card>

      <Text style={[T.caption, styles.version]}>Ember {version}</Text>

      <ConfirmDialog
        visible={confirming}
        title="Delete all your data?"
        body="Your streak, lifetime days, journal, companions and onboarding answers will be erased from this device. This can’t be undone."
        confirmLabel="Delete everything"
        cancelLabel="Keep my data"
        onConfirm={() => {
          setConfirming(false);
          onDelete();
        }}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {justifyContent: 'center', alignItems: 'flex-start'},
  title: {color: colors.ink, marginTop: 8},
  section: {color: colors.muted, marginTop: 32, marginBottom: 12},
  card: {paddingVertical: 0, paddingHorizontal: 16},
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12},
  rowText: {color: colors.ink},
  pressed: {opacity: 0.6},
  note: {color: colors.muted},
  flex: {flex: 1},
  danger: {color: colors.ink, fontWeight: '600'},
  dangerSub: {color: colors.muted, marginTop: 4},
  version: {color: colors.frame, textAlign: 'center', marginTop: 40},
});
