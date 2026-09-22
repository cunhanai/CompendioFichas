import type { Character, Identity, Speed } from '@/entities/character/model/types';

export function setName(character: Character, name: string): Character {
  return { ...character, name };
}

export function updateIdentity(character: Character, patch: Partial<Identity>): Character {
  return { ...character, identity: { ...character.identity, ...patch } };
}

export function setAlignmentLaw(
  character: Character,
  alignmentLaw: Character['alignmentLaw'],
): Character {
  return { ...character, alignmentLaw };
}

export function setAlignmentMoral(
  character: Character,
  alignmentMoral: Character['alignmentMoral'],
): Character {
  return { ...character, alignmentMoral };
}

export function addClass(character: Character, name: string): Character {
  return {
    ...character,
    classes: [...character.classes, { id: crypto.randomUUID(), name, level: 1 }],
  };
}

/** Only 1 effective level per call, on whichever class is chosen. */
export function levelUpClass(character: Character, className: string): Character {
  return {
    ...character,
    classes: character.classes.map((c) =>
      c.name === className ? { ...c, level: c.level + 1 } : c,
    ),
  };
}

export function setSpeed(character: Character, patch: Partial<Speed>): Character {
  return { ...character, speed: { ...character.speed, ...patch } };
}

export function addLanguage(character: Character, name: string): Character {
  return { ...character, languages: [...character.languages, { id: crypto.randomUUID(), name }] };
}

export function removeLanguage(character: Character, id: string): Character {
  return { ...character, languages: character.languages.filter((l) => l.id !== id) };
}

export function setXp(
  character: Character,
  patch: { xpEnabled?: boolean; xpCurrent?: number; xpMax?: number },
): Character {
  return { ...character, ...patch };
}

export function setStory(character: Character, story: string): Character {
  return { ...character, story };
}
