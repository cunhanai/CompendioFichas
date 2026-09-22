import type { AmmoLogEntry, Character, Weapon } from '@/entities/character/model/types';
import type { WeaponLibraryItem } from '@/entities/library-item/model/types';

export function addBlankWeapon(character: Character): Character {
  const weapon: Weapon = {
    id: crypto.randomUUID(),
    name: 'Nova arma',
    atk: '+0',
    crit: 'x2',
    dmg: '1d6',
    type: 'Cortante',
    range: '—',
    desc: '',
    hasAmmo: false,
    ammoCurrent: 0,
    ammoMax: 0,
    ammoLog: [],
  };
  return { ...character, weapons: [...character.weapons, weapon] };
}

export function addWeaponFromLibrary(character: Character, tpl: WeaponLibraryItem): Character {
  const weapon: Weapon = {
    id: crypto.randomUUID(),
    name: tpl.name,
    atk: tpl.atk,
    crit: tpl.crit,
    dmg: tpl.dmg,
    type: tpl.type,
    range: tpl.range,
    desc: tpl.desc,
    hasAmmo: tpl.hasAmmo,
    ammoCurrent: tpl.hasAmmo ? tpl.ammoMax : 0,
    ammoMax: tpl.ammoMax,
    ammoLog: [],
  };
  return { ...character, weapons: [...character.weapons, weapon] };
}

function withWeapon(character: Character, id: string, mutate: (w: Weapon) => Weapon): Character {
  return { ...character, weapons: character.weapons.map((w) => (w.id === id ? mutate(w) : w)) };
}

export function patchWeapon(character: Character, id: string, patch: Partial<Weapon>): Character {
  return withWeapon(character, id, (w) => ({ ...w, ...patch }));
}

export function toggleWeaponAmmo(character: Character, id: string): Character {
  return withWeapon(character, id, (w) => ({ ...w, hasAmmo: !w.hasAmmo }));
}

export function adjustAmmo(character: Character, id: string, delta: number): Character {
  return withWeapon(character, id, (w) => {
    const next = Math.max(0, Math.min(w.ammoMax, w.ammoCurrent + delta));
    if (next === w.ammoCurrent) return w;
    const entry: AmmoLogEntry = { id: crypto.randomUUID(), delta: next - w.ammoCurrent };
    return { ...w, ammoCurrent: next, ammoLog: [entry, ...w.ammoLog] };
  });
}

export function reloadAmmo(character: Character, id: string): Character {
  return withWeapon(character, id, (w) => {
    if (w.ammoCurrent === w.ammoMax) return w;
    const entry: AmmoLogEntry = { id: crypto.randomUUID(), delta: w.ammoMax - w.ammoCurrent };
    return { ...w, ammoCurrent: w.ammoMax, ammoLog: [entry, ...w.ammoLog] };
  });
}

export function moveWeapon(character: Character, id: string, toIndex: number): Character {
  const fromIndex = character.weapons.findIndex((w) => w.id === id);
  if (fromIndex === -1 || fromIndex === toIndex) return character;
  const weapons = [...character.weapons];
  const [moved] = weapons.splice(fromIndex, 1);
  weapons.splice(toIndex, 0, moved);
  return { ...character, weapons };
}

export function removeAmmoLogEntry(
  character: Character,
  weaponId: string,
  logId: string,
): Character {
  return withWeapon(character, weaponId, (w) => {
    const entry = w.ammoLog.find((e) => e.id === logId);
    if (!entry) return w;
    return {
      ...w,
      ammoCurrent: Math.max(0, Math.min(w.ammoMax, w.ammoCurrent - entry.delta)),
      ammoLog: w.ammoLog.filter((e) => e.id !== logId),
    };
  });
}
