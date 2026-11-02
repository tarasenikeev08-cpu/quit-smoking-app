import React from 'react';
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  TextStyle,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {colors, radius, type as T} from '@/theme';

/* ---------------------------------- Text ---------------------------------- */

type TxtProps = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

export const Label = ({children, style}: TxtProps) => (
  <Text style={[T.label, style]}>{children}</Text>
);

export const Muted = ({children, style, numberOfLines}: TxtProps) => (
  <Text numberOfLines={numberOfLines} style={[{color: colors.muted, fontSize: 11}, style]}>
    {children}
  </Text>
);

/* --------------------------------- Button --------------------------------- */

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'light' | 'soft';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({label, onPress, variant = 'primary', disabled, style}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({pressed}) => [
        styles.btnBase,
        variant === 'primary' && styles.btnPrimary,
        variant === 'outline' && styles.btnOutline,
        variant === 'light' && styles.btnLight,
        variant === 'soft' && styles.btnSoft,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text
        style={[
          T.button,
          variant === 'primary' && {color: colors.onInk},
          variant === 'light' && {color: colors.ink},
          variant === 'outline' && {color: colors.ink},
          variant === 'soft' && {color: colors.ink},
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------------------------------- Card ---------------------------------- */

type CardProps = {
  children: React.ReactNode;
  strong?: boolean; // ink border vs hairline
  style?: StyleProp<ViewStyle>;
};

export function Card({children, strong, style}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        {borderColor: strong ? colors.borderStrong : colors.border},
        style,
      ]}>
      {children}
    </View>
  );
}

/* --------------------------------- Stat box -------------------------------- */

export function Stat({
  k,
  v,
  strong = true,
  style,
}: {
  k: string;
  v: React.ReactNode;
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        styles.stat,
        {borderColor: strong ? colors.borderStrong : colors.border},
        style,
      ]}>
      <Text style={styles.statK}>{k}</Text>
      <View style={styles.statVRow}>
        {typeof v === 'string' || typeof v === 'number' ? (
          <Text style={styles.statV}>{v}</Text>
        ) : (
          v
        )}
      </View>
    </View>
  );
}

/* ---------------------------------- Pill ---------------------------------- */

export function Pill({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, active ? styles.pillActive : styles.pillIdle]}>
      {icon}
      <Text
        style={[
          styles.pillText,
          {color: active ? colors.onInk : colors.muted},
          icon ? {marginLeft: 5} : null,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* --------------------------------- Divider -------------------------------- */

export const Hair = ({style}: {style?: StyleProp<ViewStyle>}) => (
  <View style={[styles.hair, style]} />
);

const styles = StyleSheet.create({
  btnBase: {
    borderRadius: radius.pill,
    paddingVertical: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {backgroundColor: colors.ink},
  btnOutline: {borderWidth: 1.5, borderColor: colors.ink},
  btnLight: {backgroundColor: colors.paper},
  btnSoft: {backgroundColor: colors.pill, borderWidth: 1.5, borderColor: colors.ink},
  pressed: {opacity: 0.8},
  disabled: {opacity: 0.4},

  card: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    padding: 14,
  },

  stat: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: colors.card,
  },
  statK: {
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statVRow: {flexDirection: 'row', alignItems: 'center', marginTop: 2},
  statV: {fontSize: 18, color: colors.ink, fontWeight: '500'},

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillActive: {backgroundColor: colors.ink, borderColor: colors.ink},
  pillIdle: {backgroundColor: 'transparent', borderColor: colors.border},
  pillText: {fontSize: 11},

  hair: {height: 1, backgroundColor: colors.hair},
});
