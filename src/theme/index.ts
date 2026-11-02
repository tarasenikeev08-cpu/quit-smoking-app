/**
 * Ember design tokens — the single source of truth for the look.
 * Everything monochrome except the flame. One accent, used sparingly.
 */
export const colors = {
  paper: '#F4F3EF', // screen background (warm, not white)
  card: '#FBFBF9',
  ink: '#1A1A17', // text / strong strokes
  muted: '#9A988F',
  border: '#E2E0D8',
  borderStrong: '#1A1A17',
  hair: '#E7E5DD',
  accent: '#F2A61E', // flame
  accent2: '#F6C945', // flame core
  accent3: '#FBE9A8', // flame inner core
  pill: '#E8E6DE',
  soft: '#ECEAE2',
  softer: '#EFEDE5',
  frame: '#C9C7BE', // device bezel / locked tints
  onInk: '#F4F3EF', // text on ink surfaces
  mutedOnInk: '#7A7A74',
} as const;

export const radius = {
  lg: 30, // screen frame
  md: 16, // cards
  sm: 14, // small cards
  pill: 40, // buttons
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
} as const;

export const stroke = {
  standard: 1.5,
  companion: 2.4,
} as const;

/**
 * Type scale. System sans; weight 500 for numbers/headings;
 * uppercase + letter-spacing for labels and buttons.
 */
export const type = {
  display: { fontSize: 44, fontWeight: '500' as const, lineHeight: 46 },
  h1: { fontSize: 24, fontWeight: '500' as const },
  h2: { fontSize: 22, fontWeight: '500' as const },
  h3: { fontSize: 18, fontWeight: '500' as const },
  h4: { fontSize: 16, fontWeight: '500' as const },
  body: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: '400' as const },
  tiny: { fontSize: 10, fontWeight: '400' as const },
  statValue: { fontSize: 18, fontWeight: '500' as const },
  label: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    color: colors.muted,
  },
  button: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
} as const;

export const theme = { colors, radius, spacing, stroke, type };
export type Theme = typeof theme;
