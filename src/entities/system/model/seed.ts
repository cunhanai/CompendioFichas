import type { RpgSystem } from './types';
import pathfinderLogo from '@/assets/pathfinder-logo.png';

export const PATHFINDER_SYSTEM_ID = 'pathfinder-1e';

export const SEED_SYSTEMS: RpgSystem[] = [
  {
    id: PATHFINDER_SYSTEM_ID,
    title: 'Pathfinder 1ª Ed.',
    implemented: true,
    favorited: true,
    playerCount: 2,
    logoUrl: pathfinderLogo,
  },
  {
    id: 'dune-aventuras',
    title: 'Dune: Aventuras',
    implemented: true,
    favorited: false,
    playerCount: 0,
  },
  { id: 'tormenta20', title: 'Tormenta20', implemented: false, favorited: false, playerCount: 0 },
  {
    id: 'vampiro-mascara',
    title: 'Vampiro: A Máscara',
    implemented: false,
    favorited: false,
    playerCount: 0,
  },
];
