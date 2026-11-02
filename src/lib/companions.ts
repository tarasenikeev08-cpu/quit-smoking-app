import {CompanionId} from '@/components/Companion';
import {RANKS} from './ranks';

export type CompanionMeta = {
  id: CompanionId;
  name: string;
  /** lifetime days at which it unlocks (mirrors its rank threshold) */
  unlockDay: number;
  rankName: string;
};

export const COMPANIONS: CompanionMeta[] = RANKS.map(r => ({
  id: r.companion,
  name: companionName(r.companion),
  unlockDay: r.threshold,
  rankName: r.name,
}));

export function companionName(id: CompanionId): string {
  const names: Record<CompanionId, string> = {
    puff: 'Puff',
    sprout: 'Sprout',
    pebble: 'Pebble',
    slime: 'Slime',
    luna: 'Luna',
    mecha: 'Mecha',
    kit: 'Kit',
    dragon: 'Dragon',
    phoenix: 'Phoenix',
  };
  return names[id];
}
