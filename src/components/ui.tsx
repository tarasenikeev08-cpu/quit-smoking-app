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
import {colors, controls, radius, cardPadding, type as T} from '@/theme';

/* ---------------------------------- Text ---------------------------------- */

type TxtProps = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

/** Label token — 11 / 500 / +2 / UPPERCASE. */
export const Label = ({children, style}: TxtProps) => (
  <Text style={[T.label, {color: colors.muted}, style]}>{children}</Text>
);

/** Caption token — 12 / 400. */
export const Caption = ({children, style, numberOfLines}: TxtProps) => (
  <Text numberOfLines={numberOfLines} style={[T.caption, {color: colors.muted}, style]}>
    {children}
  </Text>
);

/** Body token — 16 / 400. */
export const Body = ({children, style, numberOfLines}: TxtProps) => (
  <Text numberOfLines={numberOfLines} style={[T.body, {color: colors.ink}, style]}>
    {children}
  </Text>
);

export const Muted = Caption;

/* --------------------------------- Button --------------------------------- */

type ButtonProps = {
  label: string;
  onPress?: () => void;
  /** primary = solid ink 52/26 · outline = 50/25 · light = solid paper (on ink) */
  variant?: 'primary' | 'outline' | 'light';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({label, onPress, variant = 'primary', disabled, style}: ButtonProps) {
  const dims =
    variant === 'outline' ? controls.outline : controls.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({pressed}) => [
        styles.btnBase,
        {height: dims.height, borderRadius: dims.radius},
        variant === 'primary' && styles.btnPrimary,
        variant === 'outline' && styles.btnOutline,
        variant === 'light' && styles.btnLight,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text
        style={[
          T.button,
          variant === 'primary' && {color: colors.onInk},
          variant === 'outline' && {color: colors.ink},
          variant === 'light' && {color: colors.ink},
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------------------------------- Card ---------------------------------- */

type CardProps = {
  children: React.ReactNode;
  /** ink border instead of the light hairline */
  strong?: boolean;
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

/** Spec: height 64, radius 12, border 1.5, label 11 muted + value 24. */
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
      <Text style={[T.label, {color: colors.muted}]}>{k}</Text>
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

/* ---------------------------------- Chip ---------------------------------- */

/** Spec: height 32, radius 20, 11pt, selected ink/paper · unselected border/muted. */
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
      accessibilityRole="button"
      style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}>
      {icon}
      <Text
        style={[
          styles.chipText,
          {color: active ? colors.onInk : colors.muted},
          icon ? {marginLeft: 6} : null,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  btnPrimary: {backgroundColor: colors.ink},
  btnOutline: {borderWidth: 1.5, borderColor: colors.ink, backgroundColor: 'transparent'},
  btnLight: {backgroundColor: colors.paper},
  pressed: {opacity: 0.8},
  disabled: {opacity: 0.4},

  card: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderRadius: radius.card,
    padding: cardPadding,
  },

  stat: {
    flex: 1,
    height: 64,
    borderWidth: 1.5,
    borderRadius: radius.stat,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  statVRow: {flexDirection: 'row', alignItems: 'center', marginTop: 2},
  statV: {...T.statValue, color: colors.ink},

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: controls.chip.height,
    borderRadius: controls.chip.radius,
    paddingHorizontal: 14,
  },
  chipActive: {backgroundColor: colors.ink},
  chipIdle: {backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border},
  chipText: {fontSize: 11, fontWeight: '500'},

  hair: {height: 1, backgroundColor: colors.hair},
});
