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
import {colors, radius, cardPadding} from '@/theme';
import {useMetrics} from '@/theme/metrics';

/* ---------------------------------- Text ---------------------------------- */

type TxtProps = {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
};

/** Label token — 0.18x day-count, +2 letter, UPPERCASE. */
export const Label = ({children, style}: TxtProps) => {
  const m = useMetrics();
  return <Text style={[m.type.label, {color: colors.muted}, style]}>{children}</Text>;
};

/** Caption token — 0.2x day-count. */
export const Caption = ({children, style, numberOfLines}: TxtProps) => {
  const m = useMetrics();
  return (
    <Text numberOfLines={numberOfLines} style={[m.type.caption, {color: colors.muted}, style]}>
      {children}
    </Text>
  );
};

/** Body token — 0.27x day-count. */
export const Body = ({children, style, numberOfLines}: TxtProps) => {
  const m = useMetrics();
  return (
    <Text numberOfLines={numberOfLines} style={[m.type.body, {color: colors.ink}, style]}>
      {children}
    </Text>
  );
};

export const Muted = Caption;

/* --------------------------------- Button --------------------------------- */

type ButtonProps = {
  label: string;
  onPress?: () => void;
  /** primary = solid ink 6.2% · outline = 5.9% · light = solid paper (on ink) */
  variant?: 'primary' | 'outline' | 'light';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({label, onPress, variant = 'primary', disabled, style}: ButtonProps) {
  const m = useMetrics();
  const dims = variant === 'outline' ? m.controls.outline : m.controls.primary;
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
        selectable={false}
        style={[
          m.type.button,
          styles.btnText,
          {color: variant === 'primary' ? colors.onInk : colors.ink},
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

/** Stretches to the height of the stat row band (11% of screen height). */
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
  const m = useMetrics();
  return (
    <View
      style={[
        styles.stat,
        {borderColor: strong ? colors.borderStrong : colors.border},
        style,
      ]}>
      <Text style={[m.type.label, {color: colors.muted}]}>{k}</Text>
      <View style={styles.statVRow}>
        {typeof v === 'string' || typeof v === 'number' ? (
          <Text style={[m.type.statValue, {color: colors.ink}]}>{v}</Text>
        ) : (
          v
        )}
      </View>
    </View>
  );
}

/* ---------------------------------- Chip ---------------------------------- */

/** Chip — 3.8% of screen height, pill radius. */
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
  const m = useMetrics();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.chip,
        {height: m.controls.chip.height, borderRadius: m.controls.chip.radius},
        active ? styles.chipActive : styles.chipIdle,
      ]}>
      {icon}
      <Text
        selectable={false}
        style={[
          m.type.label,
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

// RN Web maps these to the matching CSS properties, so Pressables don't
// show a text-selection caret or the iOS tap-highlight on long-press.
const noSelect = {
  userSelect: 'none',
  touchAction: 'manipulation',
} as any;

const styles = StyleSheet.create({
  btnBase: {alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, ...noSelect},
  btnPrimary: {backgroundColor: colors.ink},
  btnText: noSelect,
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
    alignSelf: 'stretch',
    borderWidth: 1.5,
    borderRadius: radius.stat,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  statVRow: {flexDirection: 'row', alignItems: 'center', marginTop: 2},

  chip: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, ...noSelect},
  chipActive: {backgroundColor: colors.ink},
  chipIdle: {backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border},
  chipText: {textTransform: 'none', letterSpacing: 0},

  hair: {height: 1, backgroundColor: colors.hair},
});
