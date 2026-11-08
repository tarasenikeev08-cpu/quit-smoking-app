import React from 'react';
import Svg, {Path, Circle, Rect, Ellipse, G} from 'react-native-svg';
import {colors} from '@/theme';

export type CompanionId =
  | 'puff'
  | 'sprout'
  | 'pebble'
  | 'slime'
  | 'luna'
  | 'mecha'
  | 'kit'
  | 'dragon'
  | 'phoenix';

/** Where a companion's eyes and mouth sit, in ITS OWN viewBox units. */
export type FaceGeom = {
  viewBox: number;
  eyes: {cx: number; cy: number; r: number}[];
  /** smile arc: centred at cx,cy, w wide, dipping `depth` below the baseline */
  mouth: {cx: number; cy: number; w: number; depth: number} | null;
};

/**
 * Face geometry, taken from the same reference coordinates the shapes use.
 * CompanionWake animates eyes/mouth as separate layers from this, so the
 * artwork itself is never redrawn.
 */
export function faceGeom(id: CompanionId, size: number): FaceGeom | null {
  // Puff's hero artwork is a different, richer drawing in a 150 box.
  if (id === 'puff' && size >= 100) {
    return {
      viewBox: 150,
      eyes: [
        {cx: 64, cy: 52, r: 3.2},
        {cx: 86, cy: 52, r: 3.2},
      ],
      mouth: {cx: 77, cy: 60, w: 12, depth: 6},
    };
  }
  const two = (cy: number, r: number, mouthY: number): FaceGeom => ({
    viewBox: 44,
    eyes: [
      {cx: 18, cy, r},
      {cx: 26, cy, r},
    ],
    mouth: {cx: 22, cy: mouthY, w: 6, depth: 3},
  });
  switch (id) {
    case 'puff':
      return {
        viewBox: 44,
        eyes: [
          {cx: 19, cy: 18, r: 1.8},
          {cx: 27, cy: 18, r: 1.8},
        ],
        mouth: {cx: 23, cy: 23, w: 6, depth: 3},
      };
    case 'mecha':
      return two(23, 2, 28);
    case 'slime':
      return two(24, 1.6, 28.5);
    case 'pebble':
      return two(25, 1.6, 30);
    case 'kit':
      return two(24, 1.6, 28.5);
    case 'luna':
      return {viewBox: 44, eyes: [{cx: 23, cy: 22, r: 1.5}], mouth: null};
    case 'dragon':
      return {viewBox: 44, eyes: [{cx: 20, cy: 22, r: 1.7}], mouth: null};
    case 'phoenix':
      return {viewBox: 44, eyes: [{cx: 22, cy: 14, r: 1.4}], mouth: null};
    // Sprout has no face in the reference artwork — leave it faceless.
    case 'sprout':
    default:
      return null;
  }
}

type Props = {
  id: CompanionId;
  size?: number;
  /** show eyes / face where the shape supports it */
  face?: boolean;
  /** drop a soft contact shadow under the companion */
  shadow?: boolean;
  /** render as a locked silhouette */
  locked?: boolean;
};

/**
 * Companion line-art.
 *
 * Puff, Sprout, Mecha and Slime are the EXACT paths from the design reference
 * (design/reference.html) — do not redraw them. Puff additionally has the
 * reference's detailed 150-box hero artwork, which is a different (richer)
 * drawing from its 44-box collection icon; it is used at hero sizes.
 *
 * Pebble, Luna, Kit, Dragon and Phoenix have no artwork in the reference
 * ("Commission real art or refine these before launch"), so these remain
 * placeholders drawn to the same weight and baseline.
 */
export default function Companion({
  id,
  size = 44,
  face = true,
  shadow = false,
  locked = false,
}: Props) {
  const line = locked ? colors.frame : colors.ink;
  const fill = locked ? colors.hair : colors.card;

  // Reference hero artwork (150-box) — Puff only, at larger sizes.
  if (id === 'puff' && size >= 100) {
    return (
      <Svg width={size} height={size} viewBox="0 0 150 150">
        {shadow && <Ellipse cx="75" cy="128" rx="40" ry="6" fill="#000" opacity={0.06} />}
        <Path
          d="M44 74 Q34 74 32 62 Q22 60 24 48 Q16 40 26 33 Q26 20 42 24 Q48 12 62 20 Q72 10 84 20 Q98 12 106 24 Q124 20 124 36 Q136 42 128 53 Q136 64 124 71 Q124 84 110 80 Q102 90 90 82 Q78 90 68 80 Q54 86 44 74Z"
          fill={locked ? colors.hair : '#FBFBF9'}
          stroke={line}
          strokeWidth={2.4}
        />
        {face && !locked && (
          <>
            <Circle cx="64" cy="52" r="3.2" fill={line} />
            <Circle cx="86" cy="52" r="3.2" fill={line} />
            <Path
              d="M71 60 Q77 66 83 60"
              fill="none"
              stroke={line}
              strokeWidth={2.2}
              strokeLinecap="round"
            />
          </>
        )}
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      {shadow && <Ellipse cx="22" cy="40" rx="13" ry="2.4" fill="#000" opacity={0.06} />}
      <Shape id={id} line={line} fill={fill} face={face && !locked} />
    </Svg>
  );
}

function Shape({
  id,
  line,
  fill,
  face,
}: {
  id: CompanionId;
  line: string;
  fill: string;
  face: boolean;
}) {
  const eye = {fill: line} as const;
  const sw = 2;

  switch (id) {
    // ---- exact reference artwork ----
    case 'puff':
      return (
        <G>
          <Path
            d="M15 30 Q10 30 9 24 Q4 23 5 17 Q2 13 8 10 Q8 4 15 7 Q18 1 23 6 Q29 1 32 8 Q39 6 38 14 Q43 17 37 22 Q41 28 34 29 Q33 35 27 31 Q22 36 18 31 Q15 33 15 30Z"
            fill={fill}
            stroke={line}
            strokeWidth={sw}
          />
          {face && (
            <>
              <Circle cx="19" cy="18" r="1.8" {...eye} />
              <Circle cx="27" cy="18" r="1.8" {...eye} />
            </>
          )}
        </G>
      );
    case 'sprout':
      return (
        <G>
          <Path d="M22 38 L22 20" stroke={line} strokeWidth={sw} />
          <Path d="M22 22 Q11 18 12 9 Q22 10 22 20" fill={fill} stroke={line} strokeWidth={sw} />
          <Path d="M22 26 Q33 22 32 13 Q22 14 22 24" fill={fill} stroke={line} strokeWidth={sw} />
        </G>
      );
    case 'mecha':
      return (
        <G>
          <Path d="M22 14 L22 8" stroke={line} strokeWidth={sw} />
          <Rect x="12" y="14" width="20" height="18" rx="3" fill={fill} stroke={line} strokeWidth={sw} />
          {face && (
            <>
              <Circle cx="18" cy="23" r="2" {...eye} />
              <Circle cx="26" cy="23" r="2" {...eye} />
            </>
          )}
        </G>
      );
    case 'slime':
      return (
        <G>
          <Path
            d="M9 32 Q9 16 22 16 Q35 16 35 32 Q28 28 22 32 Q16 36 9 32Z"
            fill={fill}
            stroke={line}
            strokeWidth={sw}
          />
          {face && (
            <>
              <Circle cx="18" cy="24" r="1.6" {...eye} />
              <Circle cx="26" cy="24" r="1.6" {...eye} />
            </>
          )}
        </G>
      );

    // ---- placeholders: no artwork in the reference ----
    case 'pebble':
      return (
        <G>
          <Path d="M9 30 Q8 16 22 15 Q36 16 35 30 Q36 36 22 36 Q8 36 9 30Z" fill={fill} stroke={line} strokeWidth={sw} />
          {face && (
            <>
              <Circle cx="18" cy="25" r="1.6" {...eye} />
              <Circle cx="26" cy="25" r="1.6" {...eye} />
            </>
          )}
        </G>
      );
    case 'luna':
      return (
        <G>
          <Path d="M30 8 Q16 10 16 22 Q16 34 30 36 Q20 30 20 22 Q20 14 30 8Z" fill={fill} stroke={line} strokeWidth={sw} />
          {face && <Circle cx="23" cy="22" r="1.5" {...eye} />}
        </G>
      );
    case 'kit':
      return (
        <G>
          <Path d="M12 14 L16 22 L10 22Z" fill={fill} stroke={line} strokeWidth={sw} />
          <Path d="M32 14 L34 22 L28 22Z" fill={fill} stroke={line} strokeWidth={sw} />
          <Path d="M11 24 Q11 14 22 14 Q33 14 33 24 Q33 34 22 34 Q11 34 11 24Z" fill={fill} stroke={line} strokeWidth={sw} />
          {face && (
            <>
              <Circle cx="18" cy="24" r="1.6" {...eye} />
              <Circle cx="26" cy="24" r="1.6" {...eye} />
            </>
          )}
        </G>
      );
    case 'dragon':
      return (
        <G>
          <Path d="M16 10 L20 16" stroke={line} strokeWidth={sw} strokeLinecap="round" />
          <Path d="M12 20 Q12 12 22 13 Q34 14 34 24 Q34 32 24 32 L24 36 Q14 36 14 28 Q10 26 12 20Z" fill={fill} stroke={line} strokeWidth={sw} />
          <Path d="M32 24 L38 22 L35 27Z" fill={fill} stroke={line} strokeWidth={sw} />
          {face && <Circle cx="20" cy="22" r="1.7" {...eye} />}
        </G>
      );
    case 'phoenix':
      return (
        <G>
          <Path d="M22 34 Q14 30 8 20 Q16 22 22 26 Q28 22 36 20 Q30 30 22 34Z" fill={fill} stroke={line} strokeWidth={sw} />
          <Path d="M22 26 Q20 16 22 8 Q24 16 22 26Z" fill={fill} stroke={line} strokeWidth={sw} />
          {face && <Circle cx="22" cy="14" r="1.4" {...eye} />}
        </G>
      );
    default:
      return null;
  }
}
