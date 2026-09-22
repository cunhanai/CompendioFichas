import type { ArmorItem, Character, EquipmentItem, Money } from '@/entities/character/model/types';

export function setMoneyField(character: Character, field: keyof Money, value: number): Character {
  return { ...character, money: { ...character.money, [field]: Math.max(0, value) } };
}

export function setLoadField(
  character: Character,
  field: keyof Character['load'],
  value: number,
): Character {
  return { ...character, load: { ...character.load, [field]: Math.max(0, value) } };
}

export function addEquipment(character: Character, item: Omit<EquipmentItem, 'id'>): Character {
  return {
    ...character,
    equipment: [...character.equipment, { ...item, id: crypto.randomUUID() }],
  };
}

export function removeEquipment(character: Character, id: string): Character {
  return { ...character, equipment: character.equipment.filter((e) => e.id !== id) };
}

export function addArmorItem(character: Character, item: Omit<ArmorItem, 'id'>): Character {
  return {
    ...character,
    armorItems: [...character.armorItems, { ...item, id: crypto.randomUUID() }],
  };
}

export function removeArmorItem(character: Character, id: string): Character {
  return { ...character, armorItems: character.armorItems.filter((a) => a.id !== id) };
}
