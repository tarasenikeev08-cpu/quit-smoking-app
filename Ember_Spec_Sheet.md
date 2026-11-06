# Ember — Build Spec Sheet (390 × 844, real iPhone)

> Exact sizing, type, and spacing for the live React Native app. Scaled for a real phone screen (iPhone 390×844 pt), NOT the old 300×494 mockup frame. Build to these numbers. Keep the palette and companion art from the design reference; this sheet overrides the reference's proportions.

---

## Palette (unchanged)
- Paper (screen bg): `#F4F3EF`
- Card bg: `#FBFBF9`
- Ink (text/strong/fills): `#1A1A17`
- Muted (labels/secondary): `#9A988F`
- Border (light): `#E2E0D8`
- Border (strong): `#1A1A17`
- Flame accent: `#F2A61E` · flame core `#F6C945`
- Rule: everything monochrome except the flame.

## Type scale
Font: **system sans** (SF Pro on iOS — the RN default `System`). Weights: 400 regular, 500 medium, 600 semibold.

| Token | Size | Weight | Spacing | Use |
|---|---|---|---|---|
| Display | 72 | 500 | tight | the big streak day-count number |
| H1 | 34 | 500 | normal | rank name, onboarding headline |
| H2 | 22 | 500 | normal | section headlines |
| Stat value | 24 | 500 | normal | $ saved / avoided numbers |
| Body | 16 | 400 | normal | paragraph / descriptions |
| Button | 15 | 500 | +1.5 letter, UPPERCASE | all primary buttons |
| Label | 11 | 500 | +2 letter, UPPERCASE | "DAYS CLEAN", "SAVED", tab labels |
| Caption | 12 | 400 | normal | footnotes, "≈ N packs" |

## Spacing scale (use these, nothing in between)
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 48`
- Screen side padding (gutter): **20** left/right
- Gap between stacked cards: **12**
- Card internal padding: **16**
- Safe-area top: respect the notch (use SafeAreaView); content starts below it

## Buttons
| Button | Height | Radius | Fill | Text |
|---|---|---|---|---|
| Primary (Hold bar) | 56 | 28 (full pill) | bg `#E8E6DE`, border 1.5 `#1A1A17`; fills `#1A1A17` on hold | Button token, ink → inverts to paper as fill passes |
| Primary (solid) | 52 | 26 (pill) | `#1A1A17` | Button token, paper `#F4F3EF` |
| Secondary (outline) | 50 | 25 (pill) | transparent, border 1.5 `#1A1A17` | Button token, ink |
| Chip (trigger/tier) | 32 | 20 | selected: fill ink / unselected: border 1.5 `#E2E0D8` | 11pt, selected paper / unselected muted |

## Strokes & radii
- Standard stroke: **1.5px**
- Companion outline stroke: **2.2–2.4px**
- Card radius: **14–16**
- Stat card radius: **12**

## Icons
- Tab bar icons: **24** · active ink `#1A1A17` · inactive muted `#9A988F`
- Flame next to streak number: height ≈ **0.4× the number's cap height** (so ~28 tall next to the 72 Display)
- Collection cube / header icons: **20**

---

## HOME screen layout (390 × 844)
Vertical order, top (below safe area) to bottom (above tab bar). Tab bar = 56 tall, pinned bottom.

1. **Header row** — rank name (Label token, e.g. "ASH") left · collection cube icon (20) right. Height ~44, padding 20 sides.
2. **Flexible top spacer** — absorbs slack (≈ 40% of leftover height).
3. **Companion** — centered. Hero size: **width 150, height ~165**. This is the visual anchor — make it generous, it should own the upper-middle.
4. **Gap** — 12.
5. **Day count group** — big number (Display 72) + flame inline, then "DAYS CLEAN" (Label) directly under, gap 4. This group sits tight together.
6. **Flexible bottom spacer** — remaining slack (≈ 60%), so the count group sits a touch above center and the action block anchors low.
7. **Stat row** — two cards side by side, gap 12: "SAVED $X" and "AVOIDED N". Each: height 64, radius 12, border 1.5, label 11 muted + value 24.
8. **Gap** — 16.
9. **Hold bar** — full-width (minus 20 gutters), height 56, pill. The signature button.
10. **Gap** — 16 to tab bar.

Key rule: NO single dead 200px void. Distribute slack via the two flexible spacers (40/60) so the screen reads balanced on a tall phone, companion generous up top, action anchored at the bottom.

## TAB BAR (all screens)
- Height 56, top border 1.5 `#E2E0D8`, bg paper.
- 4 icons (24), evenly spaced, active ink / inactive muted. No labels (icon-only) OR 11pt labels under — match reference (icon-only).

---

*Fill real values from state. These are the fixed dimensions; content is dynamic.*
