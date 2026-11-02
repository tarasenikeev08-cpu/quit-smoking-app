import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {colors} from '@/theme';

type Props = {
  size?: number;
  /** 1 = outer only, 2 = + mid core, 3 = full inner core */
  layers?: 1 | 2 | 3;
  /** render grey/ember when streak is at risk */
  cold?: boolean;
};

const RATIO = 120 / 96;

/**
 * The amber flame — the only colour accent in the app.
 */
export default function Flame({size = 28, layers = 1, cold = false}: Props) {
  const width = size;
  const height = size * RATIO;
  const outer = cold ? '#B7B5AC' : colors.accent;
  const mid = cold ? '#C9C7BE' : colors.accent2;
  const inner = cold ? '#D8D6CE' : colors.accent3;

  return (
    <Svg width={width} height={height} viewBox="0 0 96 120">
      <Path
        d="M48 16 C40 40 20 48 24 76 C26 100 42 110 48 110 C54 110 70 100 72 76 C76 48 56 40 48 16Z"
        fill={outer}
      />
      {layers >= 2 && (
        <Path
          d="M48 40 C43 56 33 62 36 80 C38 96 44 104 48 104 C52 104 58 96 60 80 C63 62 53 56 48 40Z"
          fill={mid}
        />
      )}
      {layers >= 3 && (
        <Path
          d="M48 62 C45 72 40 76 42 86 C43 94 46 98 48 98 C50 98 53 94 54 86 C56 76 51 72 48 62Z"
          fill={inner}
        />
      )}
    </Svg>
  );
}
