# Ember — Proportion Rules (Home-anchored, screen-relative)

> Every size is expressed as a **percentage of screen height or width**, so Home looks identical on any iPhone (390×844, 393×852, 430×932, etc.). Home sets the reference ratios; every other screen reuses the same tokens. **No fixed pixel values for layout** — only for strokes (1.5px) and icon sizes.

---

## Reference measurements

Design reference frame: **300 wide × 494 tall**. Breaking Home into vertical bands as percentages of frame height (494):

| Band | Reference px | % of height | Role |
|---|---|---|---|
| Top safe area | 20 | 4% | Status bar / notch clearance |
| Header row (rank label + collection icon) | 32 | 6.5% | — |
| Gap above companion | 20 | 4% | — |
| Companion (hero drawing) | 150 | 30% | **Visual anchor — biggest element** |
| Gap | 8 | 1.5% | — |
| Day count group (number 44 + label 12) | 60 | 12% | Streak number + "DAYS CLEAN" |
| **Flex gap (absorbs extra screen height)** | variable | **~15%** | Only flexible band — sits BELOW the count, pushes action block down |
| Stat row (two cards) | 56 | 11% | Saved / Avoided |
| Gap | 16 | 3% | — |
| Hold bar | 56 | 11% | Primary action |
| Bottom gap above tab bar | 16 | 3% | — |
| Tab bar | — | — | 56pt fixed, below everything |

Screen side padding (gutter): **5.5% of width** (= 20pt on a 390 screen).

## Vertical rule (critical)
There is **ONE flexible gap** in the whole layout, sitting between the day count and the stat row. All other spaces are **fixed percentages of height**. This means: on a taller phone, the empty space goes in that ONE spot, not scattered across the screen. The companion stays visually anchored high, the action block stays anchored low, and the gap between them absorbs whatever slack the phone has.

**Do NOT put flex spacers above the companion or below the hold bar.** Only the single one noted above.

## Element widths (% of screen width)
| Element | Width | Notes |
|---|---|---|
| Companion drawing | 45% | Hero, centered |
| Stat cards (each) | 44% | Two side-by-side with gap 3% between |
| Hold bar | 89% | Full width minus 5.5% gutters |

## Type scale — anchored to Home's day-count number
The day-count number is the **largest text**. Everything else is a ratio of it.

| Token | Ratio of day-count size | On 390×844 | Use |
|---|---|---|---|
| Day count | 1.0 (base) | ~60pt | Streak number |
| H1 | 0.55 | ~33pt | Rank name, onboarding headline |
| H2 | 0.37 | ~22pt | Section headlines |
| Stat value | 0.4 | ~24pt | $ saved / avoided |
| Body | 0.27 | ~16pt | Descriptions |
| Button | 0.25 | ~15pt | UPPERCASE, +1.5 letter-spacing |
| Label | 0.18 | ~11pt | UPPERCASE, +2 letter-spacing |
| Caption | 0.2 | ~12pt | Footnotes |

**Base day-count size formula:** `screenHeight × 0.071` (so ~60 on a 390×844, ~66 on a 430×932 — scales with the device). Everything else uses the ratios above.

## Buttons (heights as % of height)
| Button | Height % | Radius |
|---|---|---|
| Hold bar | 6.6% | 50% of height (full pill) |
| Primary solid | 6.2% | pill |
| Secondary outline | 5.9% | pill |
| Chip | 3.8% | pill |

Letter-spacing and weight unchanged from spec sheet: 500 weight, uppercase on buttons/labels with +1.5–2pt letter-spacing.

## Palette, strokes, radii, icons — unchanged from `/design/spec.md`
- Palette: paper #F4F3EF, card #FBFBF9, ink #1A1A17, muted #9A988F, border #E2E0D8, flame #F2A61E / core #F6C945
- Standard stroke: 1.5px (not scaled — real pixel)
- Companion stroke: 2.2–2.4px (not scaled)
- Card radius: 14–16 (not scaled)
- Tab bar icon size: 24 (not scaled — real pixel)

---

## Applying to other screens
Every other screen uses the **same type scale, same gutters (5.5% sides), same button heights, and the same single-flex-gap rule**: anchor content top, anchor action bottom, put the one flex spacer in between.

- **Rank:** header % → money-saved hero card (same band as companion, ~30% height) → lifetime/streak row → flex → tier list → footnote.
- **Journal check-in:** header % → craving bar → triggers → mood → flex → Save button anchored bottom.
- **Collection:** header % → equipped card → companion grid → flex → footnote.
- **Insights:** header % → insight card → chart → tip → flex → See full log button anchored bottom.
- **Slip/recovery:** header % → headline → flame + chips → restore row → flex absorbs → CTA at bottom.

## What this fixes
- No more "top-heavy or bottom-heavy": the one flex gap always lives in the same place between stable top and stable bottom.
- No more "empty": the companion owns 30% of screen height — it can't be a tiny cloud in a void.
- Looks identical on any iPhone: percentages scale, so 390×844 and 430×932 feel the same proportionally.
