import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useCharacter } from '@/app/providers';
import { computeAllAbilities, computeSkills } from '@/entities/character/model/calculations';
import { MULTI_SKILL_CATEGORIES } from '@/entities/character/model/skillCatalog';
import { SkillRow, SkillDialog, ConditionalModsDialog, AddMultiSkillRow } from '@/features/skills';
import { addMultiSkill } from '@/features/skills/model/mutations';
import {
  SectionCard,
  SectionCardButton,
  SectionCardHeader,
} from '@/shared/ui/molecules/SectionCard';
import { Badge } from '@/shared/ui/atoms/Badge';

export function PericiasTab({ characterId }: { characterId: string }) {
  const { character, update } = useCharacter(characterId);
  const [skillKey, setSkillKey] = useState<string | null>(null);
  const [condOpen, setCondOpen] = useState(false);

  const abilities = computeAllAbilities(character.abilities);
  const skills = computeSkills(character.skills, abilities);

  return (
    <div className="flex flex-col gap-5">
      <SectionCard>
        <SectionCardHeader
          title="Perícias"
          action={
            <span className="flex items-center gap-1 text-[10px] text-neutral-600">
              ● perícia de classe · <Lock className="h-3 w-3" strokeWidth={2.4} /> exige treinamento
            </span>
          }
        />
        <div className="flex flex-col divide-y divide-neutral-800/70">
          {skills.map((skill) => (
            <SkillRow key={skill.key} skill={skill} onOpen={() => setSkillKey(skill.key)} />
          ))}
        </div>

        {character.active && (
          <div className="mt-4 flex flex-col gap-2 border-t border-neutral-800/70 pt-4">
            <span className="text-[11px] tracking-wider text-neutral-500 uppercase">
              Adicionar especialização
            </span>
            {MULTI_SKILL_CATEGORIES.map((category) => (
              <AddMultiSkillRow
                key={category.categoryKey}
                category={category}
                onAdd={(specialization) =>
                  update((c) => addMultiSkill(c, category, specialization))
                }
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCardButton onClick={() => setCondOpen(true)}>
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Modificadores condicionais
        </h3>
        <div className="flex flex-wrap gap-2">
          {character.conditionalMods.map((m) => (
            <Badge key={m.id} tone="amber" size="md">
              {m.text}
            </Badge>
          ))}
          {character.conditionalMods.length === 0 && (
            <span className="text-xs text-neutral-600">Nenhum modificador condicional.</span>
          )}
        </div>
      </SectionCardButton>

      {skillKey && (
        <SkillDialog
          open
          onOpenChange={(o) => !o && setSkillKey(null)}
          skillKey={skillKey}
          character={character}
          update={update}
        />
      )}
      <ConditionalModsDialog
        open={condOpen}
        onOpenChange={setCondOpen}
        character={character}
        update={update}
      />
    </div>
  );
}
