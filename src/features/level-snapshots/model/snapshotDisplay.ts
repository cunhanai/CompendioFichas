import { Camera, Flag, History, TrendingUp, type LucideIcon } from 'lucide-react';
import type { LevelSnapshot } from '@/entities/character/model/types';

/** Icon + color per snapshot kind, shared between every place a snapshot list renders one
 * (HistoricoTab's two tabs, SnapshotTree) so a new kind only needs updating here. */
export const SNAPSHOT_KIND_ICON: Record<LevelSnapshot['kind'], LucideIcon> = {
  'level-up': TrendingUp,
  'restore-point': History,
  start: Flag,
  manual: Camera,
};

export const SNAPSHOT_KIND_COLOR: Record<LevelSnapshot['kind'], string> = {
  'level-up': 'text-emerald-400',
  'restore-point': 'text-sky-400',
  start: 'text-amber-400',
  manual: 'text-violet-400',
};
