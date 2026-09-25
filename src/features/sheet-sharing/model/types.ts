import type { Character } from '@/entities/character/model/types';

/** One character someone else shared with the current user — always view-only. */
export interface SharedCharacterEntry {
  character: Character;
  ownerName: string;
  ownerUsername: string;
}

/** One account a character (owned by the current user) has been shared with. */
export interface CharacterShareEntry {
  userId: string;
  name: string;
  username: string;
}
