import type { RpgSystem } from './types';

export const PATHFINDER_SYSTEM_ID = 'pathfinder-1e';

export const SEED_SYSTEMS: RpgSystem[] = [
  {
    id: PATHFINDER_SYSTEM_ID,
    title: 'Pathfinder 1ª Ed.',
    status: 'active',
    favorited: true,
    playerCount: 2,
  },
  {
    id: 'dune-aventuras',
    title: 'Dune: Aventuras',
    status: 'inactive',
    favorited: false,
    playerCount: 0,
  },
  { id: 'tormenta20', title: 'Tormenta20', status: 'soon', favorited: false, playerCount: 0 },
  {
    id: 'vampiro-mascara',
    title: 'Vampiro: A Máscara',
    status: 'soon',
    favorited: false,
    playerCount: 0,
  },
];
