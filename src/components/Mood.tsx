import React from 'react';
import Svg, {Path, Circle, Line, G} from 'react-native-svg';
import {colors} from '@/theme';

/**
 * The mood scale — a cloud -> sun progression, so each step reads as weather
 * rather than an anonymous dot. Drawn in the same ink line-art language as the
 * companions (24 viewBox, round caps).
 *
 * 1 storm · 2 overcast · 3 sun behind cloud · 4 mostly sun · 5 clear sun
 */
export type MoodValue = 1 | 2 | 3 | 4 | 5;

export const MOOD_LABELS: Record<MoodValue, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

type Props = {value: MoodValue; size?: number; active?: boolean};

const CLOUD = 'M7.5 17.5 H16.5 A3.5 3.5 0 0 0 16.6 10.5 A5 5 0 0 0 7.2 11.4 A3.1 3.1 0 0 0 7.5 17.5 Z';

export default function Mood({value, size = 28, active = true}: Props) {
  const color = active ? colors.ink : colors.frame;
  const sun = active ? colors.accent : colors.frame;
  const p = {
    stroke: color,
    strokeWidth: 1.9,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {value === 1 && (
        <G>
          <Path d={CLOUD} {...p} />
          <Line x1="9" y1="20" x2="8.2" y2="22" {...p} />
          <Line x1="12" y1="20" x2="11.2" y2="22.5" {...p} />
          <Line x1="15" y1="20" x2="14.2" y2="22" {...p} />
        </G>
      )}

      {value === 2 && (
        <G>
          <Path d={CLOUD} {...p} />
          <Line x1="8.5" y1="20.8" x2="15.5" y2="20.8" {...p} />
        </G>
      )}

      {value === 3 && (
        <G>
          <Circle cx="15" cy="8.5" r="3.4" stroke={sun} strokeWidth={1.9} fill="none" />
          <Path d="M9 18.5 H17 A3.2 3.2 0 0 0 17 12.2 A4.6 4.6 0 0 0 8.7 13 A2.8 2.8 0 0 0 9 18.5 Z" {...p} />
        </G>
      )}

      {value === 4 && (
        <G>
          <Circle cx="13" cy="10" r="4.3" stroke={sun} strokeWidth={1.9} fill="none" />
          <Line x1="13" y1="2.6" x2="13" y2="4.2" stroke={sun} {...{strokeWidth: 1.9, strokeLinecap: 'round' as const}} />
          <Line x1="20.2" y1="10" x2="21.8" y2="10" stroke={sun} {...{strokeWidth: 1.9, strokeLinecap: 'round' as const}} />
          <Line x1="18.3" y1="4.7" x2="19.4" y2="3.6" stroke={sun} {...{strokeWidth: 1.9, strokeLinecap: 'round' as const}} />
          <Path d="M5 19.5 H12.5 A2.7 2.7 0 0 0 12.5 14.2 A4 4 0 0 0 4.8 14.9 A2.4 2.4 0 0 0 5 19.5 Z" {...p} />
        </G>
      )}

      {value === 5 && (
        <G>
          <Circle cx="12" cy="12" r="4.6" stroke={sun} strokeWidth={2} fill="none" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
            const r1 = 7.2;
            const r2 = 9.8;
            const rad = (a * Math.PI) / 180;
            return (
              <Line
                key={a}
                x1={12 + Math.cos(rad) * r1}
                y1={12 + Math.sin(rad) * r1}
                x2={12 + Math.cos(rad) * r2}
                y2={12 + Math.sin(rad) * r2}
                stroke={sun}
                strokeWidth={2}
                strokeLinecap="round"
              />
            );
          })}
        </G>
      )}
    </Svg>
  );
}
