import { useState } from 'react';
import { useCharacter } from '@/app/providers';
import { ABILITY_KEYS } from '@/entities/character/model/constants';
import { computeAllAbilities } from '@/entities/character/model/calculations';
import type { AbilityKey } from '@/entities/character/model/types';
import { HpCard, HpDialog } from '@/features/hp-tracker';
import { AbilityScoreCard, AbilityDialog } from '@/features/ability-scores';

export function QuickStats({ characterId }: { characterId: string }) {
  const { character, update } = useCharacter(characterId);
  const [hpOpen, setHpOpen] = useState(false);
  const [openAbility, setOpenAbility] = useState<AbilityKey | null>(null);

  const abilities = computeAllAbilities(character.abilities);

  return (
    <div className="flex flex-col gap-5">
      <HpCard character={character} onOpen={() => setHpOpen(true)} />

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
        <h3 className="mb-4 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Atributos
        </h3>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {ABILITY_KEYS.map((key) => (
            <AbilityScoreCard
              key={key}
              abilityKey={key}
              computed={abilities[key]}
              onOpen={() => setOpenAbility(key)}
            />
          ))}
        </div>
      </div>

      <HpDialog open={hpOpen} onOpenChange={setHpOpen} character={character} update={update} />
      {openAbility && (
        <AbilityDialog
          open
          onOpenChange={(o) => !o && setOpenAbility(null)}
          abilityKey={openAbility}
          character={character}
          update={update}
        />
      )}
    </div>
  );
}
