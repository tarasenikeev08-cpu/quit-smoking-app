import React from 'react';
import Svg, {Path, Circle, Rect, Line} from 'react-native-svg';
import {colors} from '@/theme';

export type IconName =
  | 'circle'
  | 'notebook'
  | 'trophy'
  | 'box'
  | 'lock'
  | 'check'
  | 'checkFilled'
  | 'shieldCheck'
  | 'coins'
  | 'flame'
  | 'chevronRight'
  | 'chevronLeft'
  | 'settings'
  | 'close';

type Props = {name: IconName; size?: number; color?: string; filled?: boolean};

/** Minimal ink-line icon set (Tabler-style) drawn in a 24 viewBox. */
export default function Icon({name, size = 24, color = colors.ink}: Props) {
  const p = {stroke: color, strokeWidth: 1.8, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {render(name, p, color)}
    </Svg>
  );
}

function render(name: IconName, p: object, color: string) {
  switch (name) {
    case 'circle':
      return <Circle cx="12" cy="12" r="8" {...p} />;
    case 'notebook':
      return (
        <>
          <Path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6z" {...p} />
          <Line x1="9" y1="4" x2="9" y2="20" {...p} />
          <Line x1="13" y1="9" x2="16" y2="9" {...p} />
          <Line x1="13" y1="13" x2="16" y2="13" {...p} />
        </>
      );
    case 'trophy':
      return (
        <>
          <Path d="M8 4h8v5a4 4 0 0 1-8 0z" {...p} />
          <Path d="M8 6H5a2 2 0 0 0 0 4h1" {...p} />
          <Path d="M16 6h3a2 2 0 0 1 0 4h-1" {...p} />
          <Line x1="12" y1="13" x2="12" y2="17" {...p} />
          <Path d="M9 20h6M10 20v-3h4v3" {...p} />
        </>
      );
    case 'box':
      return (
        <>
          <Path d="M12 3 20 7v10l-8 4-8-4V7z" {...p} />
          <Path d="M4 7l8 4 8-4M12 11v10" {...p} />
        </>
      );
    case 'lock':
      return (
        <>
          <Rect x="5" y="11" width="14" height="9" rx="2" {...p} />
          <Path d="M8 11V8a4 4 0 0 1 8 0v3" {...p} />
        </>
      );
    case 'check':
      return <Path d="M5 12l4 4 10-10" {...p} />;
    case 'checkFilled':
      return (
        <>
          <Circle cx="12" cy="12" r="9" fill={color} />
          <Path d="M8 12l3 3 5-6" stroke={colors.paper} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 'shieldCheck':
      return (
        <>
          <Path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z" {...p} />
          <Path d="M9 12l2 2 4-4" {...p} />
        </>
      );
    case 'coins':
      return (
        <>
          <Circle cx="9" cy="10" r="5" {...p} />
          <Path d="M14.5 6.2A5 5 0 1 1 15 17.7" {...p} />
        </>
      );
    case 'flame':
      return (
        <Path
          d="M12 3c-1.5 4-4.5 5.5-3.8 9.5.3 2 1.8 4.5 3.8 5.5 2-1 3.5-3.5 3.8-5.5C16.5 8.5 13.5 7 12 3z"
          fill={color}
        />
      );
    case 'chevronRight':
      return <Path d="M9 6l6 6-6 6" {...p} />;
    case 'chevronLeft':
      return <Path d="M15 6l-6 6 6 6" {...p} />;
    case 'settings':
      // Tabler "settings" (MIT)
      return (
        <>
          <Path
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37c1 .608 2.296.07 2.572-1.065z"
            {...p}
          />
          <Circle cx="12" cy="12" r="3" {...p} />
        </>
      );
    case 'close':
      return <Path d="M6 6l12 12M18 6L6 18" {...p} />;
    default:
      return null;
  }
}
