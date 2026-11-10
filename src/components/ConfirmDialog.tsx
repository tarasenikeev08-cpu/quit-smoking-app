import React from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import {Button} from '@/components/ui';
import {colors, radius} from '@/theme';
import {useMetrics} from '@/theme/metrics';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * A real confirm dialog on every platform. (Alert.alert is a silent no-op on
 * react-native-web, so a destructive action guarded by it would just run.)
 */
export default function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  const m = useMetrics();
  const T = m.type;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.scrim} onPress={onCancel} accessibilityLabel="Dismiss">
        <Pressable
          style={[styles.card, {marginHorizontal: m.gutter}]}
          accessibilityRole="alert"
          // swallow taps so pressing the card doesn't dismiss it
          onPress={() => {}}>
          <Text style={[T.h2, {color: colors.ink}]}>{title}</Text>
          <Text style={[T.body, styles.body]}>{body}</Text>
          <View style={styles.actions}>
            <Button label={confirmLabel} onPress={onConfirm} />
            <Button label={cancelLabel} variant="outline" onPress={onCancel} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {flex: 1, backgroundColor: 'rgba(26,26,23,0.45)', justifyContent: 'center'},
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.card,
    padding: 20,
    // stretches between the gutters (set inline), capped on wide screens
    alignSelf: 'stretch',
    maxWidth: 430,
  },
  body: {color: colors.muted, marginTop: 8},
  actions: {marginTop: 20, gap: 12},
});
