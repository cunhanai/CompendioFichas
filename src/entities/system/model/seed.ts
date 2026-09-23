import type { RpgSystem } from './types.js';

export const PATHFINDER_SYSTEM_ID = 'pathfinder-1e';

export const SEED_SYSTEMS: RpgSystem[] = [
  {
    id: PATHFINDER_SYSTEM_ID,
    title: 'Pathfinder 1ª Ed.',
    implemented: true,
    favorited: true,
    playerCount: 2,
    logoUrl: '/pathfinder-logo.png',
  },
];
