import {useWindowDimensions} from 'react-native';

/**
 * Screen-relative proportions — the single source of truth for layout.
 * Implements Ember_Proportions.md: every layout size is a percentage of screen
 * height or width, so the app is proportionally identical on any iPhone
 * (390x844, 393x852, 430x932...). Only strokes, radii and icon sizes are
 * fixed pixels.
 */

/** Vertical bands, as a fraction of SCREEN HEIGHT. */
export const BAND = {
  header: 0.065,
  gapAboveCompanion: 0.04,
  companion: 0.3, // the visual anchor — biggest element
  gapBelowCompanion: 0.015,
  countGroup: 0.12,
  statRow: 0.11,
  gap: 0.03,
  // Control heights come from the doc's Buttons table (hold 6.6% = 56 @844).
  holdBar: 0.066,
  primaryBtn: 0.062,
  outlineBtn: 0.059,
  chip: 0.038,
} as const;

/** Widths, as a fraction of SCREEN WIDTH. */
export const WIDTH = {
  gutter: 0.055, // 20pt @390
  companion: 0.45,
  statGap: 0.03,
} as const;

/** Type ratios, anchored to the day-count number. */
export const RATIO = {
  dayCount: 1.0,
  h1: 0.55,
  h2: 0.37,
  statValue: 0.4,
  body: 0.27,
  button: 0.25,
  label: 0.18,
  caption: 0.2,
} as const;

/** Base day-count size = screenHeight x 0.071 (~60 @844, ~66 @932). */
export const baseType = (height: number) => height * 0.071;

export type Metrics = ReturnType<typeof useMetrics>;

export function useMetrics() {
  const {width, height} = useWindowDimensions();
  const base = baseType(height);
  const t = (r: number) => Math.round(base * r);
  /** band height from a fraction of screen height */
  const h = (fraction: number) => Math.round(height * fraction);
  /** width from a fraction of screen width */
  const w = (fraction: number) => Math.round(width * fraction);

  const holdH = h(BAND.holdBar);
  const primaryH = h(BAND.primaryBtn);
  const outlineH = h(BAND.outlineBtn);
  const chipH = h(BAND.chip);

  return {
    width,
    height,
    base,

    gutter: w(WIDTH.gutter),
    companionSize: w(WIDTH.companion),
    statGap: w(WIDTH.statGap),

    band: {
      header: h(BAND.header),
      gapAboveCompanion: h(BAND.gapAboveCompanion),
      companion: h(BAND.companion),
      gapBelowCompanion: h(BAND.gapBelowCompanion),
      countGroup: h(BAND.countGroup),
      statRow: h(BAND.statRow),
      gap: h(BAND.gap),
    },

    /** Pill controls — radius is always half the height. */
    controls: {
      hold: {height: holdH, radius: holdH / 2},
      primary: {height: primaryH, radius: primaryH / 2},
      outline: {height: outlineH, radius: outlineH / 2},
      chip: {height: chipH, radius: chipH / 2},
    },

    type: {
      dayCount: {
        fontSize: Math.round(base),
        fontWeight: '500' as const,
        lineHeight: Math.round(base * 1.06),
        letterSpacing: -Math.round(base * 0.02),
      },
      h1: {fontSize: t(RATIO.h1), fontWeight: '500' as const},
      h2: {fontSize: t(RATIO.h2), fontWeight: '500' as const},
      statValue: {fontSize: t(RATIO.statValue), fontWeight: '500' as const},
      body: {
        fontSize: t(RATIO.body),
        fontWeight: '400' as const,
        lineHeight: Math.round(t(RATIO.body) * 1.38),
      },
      button: {
        fontSize: t(RATIO.button),
        fontWeight: '500' as const,
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
      },
      label: {
        fontSize: t(RATIO.label),
        fontWeight: '500' as const,
        letterSpacing: 2,
        textTransform: 'uppercase' as const,
      },
      caption: {fontSize: t(RATIO.caption), fontWeight: '400' as const},
    },
  };
}
