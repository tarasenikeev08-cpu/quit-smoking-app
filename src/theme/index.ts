/**
 * Ember design tokens — built to Ember_Spec_Sheet.md (390x844 iPhone).
 * The spec sheet overrides the old 300x494 mockup's proportions.
 * Palette is unchanged from the design reference.
 */
export const colors = {
  paper: '#F4F3EF', // screen background (warm, not white)
  card: '#FBFBF9',
  ink: '#1A1A17', // text / strong strokes / fills
  muted: '#9A988F', // labels / secondary / inactive icons
  border: '#E2E0D8', // light border
  borderStrong: '#1A1A17',
  hair: '#E7E5DD',
  accent: '#F2A61E', // flame
  accent2: '#F6C945', // flame core
  accent3: '#FBE9A8', // flame inner core
  pill: '#E8E6DE', // hold-bar resting fill
  soft: '#ECEAE2',
  softer: '#EFEDE5',
  frame: '#C9C7BE', // locked tints
  onInk: '#F4F3EF', // text on ink surfaces
  mutedOnInk: '#7A7A74',
} as const;

/** Spacing scale — use these, nothing in between. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

/** Screen side padding. */
export const gutter = 20;

/** Gap between stacked cards. */
export const cardGap = 12;

/** Card internal padding. */
export const cardPadding = 16;

export const radius = {
  card: 16, // 14–16
  cardSm: 14,
  stat: 12,
  chip: 20,
  pill: 28,
} as const;

export const stroke = {
  standard: 1.5,
  companion: 2.4, // 2.2–2.4
} as const;

/** Fixed control dimensions. */
export const controls = {
  hold: {height: 56, radius: 28},
  primary: {height: 52, radius: 26},
  outline: {height: 50, radius: 25},
  chip: {height: 32, radius: 20},
  tabBar: {height: 56},
  tabIcon: 24,
  headerIcon: 20,
} as const;

/**
 * Type scale. System sans (SF Pro on iOS via the RN default).
 */
export const type = {
  display: {
    fontSize: 72,
    fontWeight: '500' as const,
    letterSpacing: -1.5,
    lineHeight: 76,
  },
  h1: {fontSize: 34, fontWeight: '500' as const},
  h2: {fontSize: 22, fontWeight: '500' as const},
  statValue: {fontSize: 24, fontWeight: '500' as const},
  body: {fontSize: 16, fontWeight: '400' as const, lineHeight: 22},
  button: {
    fontSize: 15,
    fontWeight: '500' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  label: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  caption: {fontSize: 12, fontWeight: '400' as const},
} as const;

export const theme = {colors, spacing, gutter, radius, stroke, controls, type};
export type Theme = typeof theme;
