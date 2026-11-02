import React from 'react';
import Svg, {Path, Circle, Rect, Line, Ellipse, G} from 'react-native-svg';
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
 * Ink line-art companions. Placeholder art matching the Ember reference —
 * commission final art before launch. Drawn in a 44x44 box so every shape
 * shares weight and baseline.
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
  const sw = 2.2;

  return (
    <Svg width={size} height={size} viewBox="0 0 44 44">
      {shadow && <Ellipse cx="22" cy="40" rx="13" ry="2.4" fill="#000" opacity={0.06} />}
      <Shape id={id} line={line} fill={fill} sw={sw} face={face && !locked} />
    </Svg>
  );
}

function Shape({
  id,
  line,
  fill,
  sw,
  face,
}: {
  id: CompanionId;
  line: string;
  fill: string;
  sw: number;
  face: boolean;
}) {
  const stroke = {stroke: line, strokeWidth: sw, fill} as const;
  const eye = {fill: line} as const;

  switch (id) {
    case 'puff':
      return (
        <G>
          <Path
            d="M15 30 Q10 30 9 24 Q4 23 5 17 Q2 13 8 10 Q8 4 15 7 Q18 1 23 6 Q29 1 32 8 Q39 6 38 14 Q43 17 37 22 Q41 28 34 29 Q33 35 27 31 Q22 36 18 31 Q15 33 15 30Z"
            {...stroke}
          />
          {face && (
            <>
              <Circle cx="19" cy="18" r="1.8" {...eye} />
              <Circle cx="27" cy="18" r="1.8" {...eye} />
              <Path d="M20 24 Q23 27 26 24" fill="none" stroke={line} strokeWidth={1.8} strokeLinecap="round" />
            </>
          )}
        </G>
      );
    case 'sprout':
      return (
        <G>
          <Path d="M22 38 L22 20" stroke={line} strokeWidth={sw} />
          <Path d="M22 22 Q11 18 12 9 Q22 10 22 20" {...stroke} />
          <Path d="M22 26 Q33 22 32 13 Q22 14 22 24" {...stroke} />
          {face && <Circle cx="19" cy="15" r="1.3" {...eye} />}
        </G>
      );
    case 'pebble':
      return (
        <G>
          <Path d="M9 30 Q8 16 22 15 Q36 16 35 30 Q36 36 22 36 Q8 36 9 30Z" {...stroke} />
          {face && (
            <>
              <Circle cx="18" cy="25" r="1.6" {...eye} />
              <Circle cx="26" cy="25" r="1.6" {...eye} />
            </>
          )}
        </G>
      );
    case 'slime':
      return (
        <G>
          <Path d="M9 32 Q9 16 22 16 Q35 16 35 32 Q28 28 22 32 Q16 36 9 32Z" {...stroke} />
          {face && (
            <>
              <Circle cx="18" cy="24" r="1.6" {...eye} />
              <Circle cx="26" cy="24" r="1.6" {...eye} />
            </>
          )}
        </G>
      );
    case 'luna':
      return (
        <G>
          <Path d="M30 8 Q16 10 16 22 Q16 34 30 36 Q20 30 20 22 Q20 14 30 8Z" {...stroke} />
          {face && <Circle cx="23" cy="22" r="1.5" {...eye} />}
        </G>
      );
    case 'mecha':
      return (
        <G>
          <Line x1="22" y1="14" x2="22" y2="8" stroke={line} strokeWidth={sw} />
          <Circle cx="22" cy="7" r="1.6" fill={line} />
          <Rect x="12" y="14" width="20" height="18" rx="3" {...stroke} />
          {face && (
            <>
              <Circle cx="18" cy="23" r="2" {...eye} />
              <Circle cx="26" cy="23" r="2" {...eye} />
            </>
          )}
        </G>
      );
    case 'kit':
      return (
        <G>
          <Path d="M12 14 L16 22 L10 22Z" {...stroke} />
          <Path d="M32 14 L34 22 L28 22Z" {...stroke} />
          <Path d="M11 24 Q11 14 22 14 Q33 14 33 24 Q33 34 22 34 Q11 34 11 24Z" {...stroke} />
          {face && (
            <>
              <Circle cx="18" cy="24" r="1.6" {...eye} />
              <Circle cx="26" cy="24" r="1.6" {...eye} />
              <Path d="M20 28 Q22 30 24 28" fill="none" stroke={line} strokeWidth={1.6} strokeLinecap="round" />
            </>
          )}
        </G>
      );
    case 'dragon':
      return (
        <G>
          <Path d="M16 10 L20 16" stroke={line} strokeWidth={sw} strokeLinecap="round" />
          <Path d="M12 20 Q12 12 22 13 Q34 14 34 24 Q34 32 24 32 L24 36 Q14 36 14 28 Q10 26 12 20Z" {...stroke} />
          <Path d="M32 24 L38 22 L35 27Z" {...stroke} />
          {face && <Circle cx="20" cy="22" r="1.7" {...eye} />}
        </G>
      );
    case 'phoenix':
      return (
        <G>
          <Path d="M22 34 Q14 30 8 20 Q16 22 22 26 Q28 22 36 20 Q30 30 22 34Z" {...stroke} />
          <Path d="M22 26 Q20 16 22 8 Q24 16 22 26Z" {...stroke} />
          {face && <Circle cx="22" cy="14" r="1.4" {...eye} />}
        </G>
      );
    default:
      return null;
  }
}
