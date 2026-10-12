import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { computeAllAbilities, computeSkill, signed } from '@/entities/character/model/calculations';
import { ABILITY_LONG } from '@/entities/character/model/constants';
import { SKILL_CATALOG } from '@/entities/character/model/skillCatalog';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { Switch } from '@/shared/ui/atoms/Switch';
import { VariedModRowEdit, VariedModRowView } from '@/shared/ui/molecules/VariedModRow';
import { Button } from '@/shared/ui/atoms/Button';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { parseNumberInput } from '@/shared/lib/parseNumberInput';
import {
  addSkillMod,
  removeSkill,
  removeSkillMod,
  setSkillRanks,
  toggleSkillClass,
  updateSkillMod,
} from '../model/mutations';

const CATALOG_KEYS = new Set(SKILL_CATALOG.map((tpl) => tpl.key));

export interface SkillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillKey: string;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

export function SkillDialog({ open, onOpenChange, skillKey, character, update }: SkillDialogProps) {
  // Most skills legitimately sit at 0 ranks forever (a character only invests in some of them),
  // so this never auto-opens in edit mode the way a truly untouched section would.
  const {
    editing,
    setEditing,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
    update: trackedUpdate,
  } = useEditableSection({ open, isEmpty: false, character, update, onOpenChange });
  const [confirmRemove, setConfirmRemove] = useState(false);
  const abilities = computeAllAbilities(character.abilities);
  const skill = character.skills.find((s) => s.key === skillKey);
  if (!skill) return null;
  const computed = computeSkill(skill, abilities);
  const trainedWarning = skill.trainedOnly && skill.ranks === 0;
  // Only a player-added specialization (Apresentação/Ofícios/Profissão) can be removed — the
  // fixed catalog rows have no removal entry point anywhere in the UI.
  const isRemovable = !CATALOG_KEYS.has(skillKey);

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title={skill.name}
        subtitle={`${ABILITY_LONG[skill.ability]} · ${signed(computed.abilityMod)}${skill.trainedOnly ? ' · exige treinamento' : ''}`}
        size="md"
        headerActions={
          character.active && (
            <EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />
          )
        }
      >
        <p className="mb-3 text-3xl font-bold text-neutral-100">{signed(computed.total)}</p>
        {trainedWarning && (
          <div className="mb-3 rounded-lg border border-rose-800/40 bg-rose-950/30 px-3.5 py-2.5 text-xs text-rose-300">
            Sem graduação — esta perícia não pode ser usada até ser treinada.
          </div>
        )}
        <div className="flex flex-col divide-y divide-neutral-800/70">
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-neutral-400">Modificador de {ABILITY_LONG[skill.ability]}</span>
            <span className="font-medium text-neutral-100">{signed(computed.abilityMod)}</span>
          </div>
          {!editing ? (
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-neutral-400">Graduação</span>
              <span className="font-medium text-neutral-100">{skill.ranks}</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="shrink-0 text-neutral-400">Graduação</span>
              <input
                type="number"
                value={skill.ranks}
                onChange={(e) => {
                  const value = parseNumberInput(e.target.value);
                  if (value !== null) trackedUpdate((c) => setSkillRanks(c, skillKey, value));
                }}
                className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-neutral-100 outline-none focus:border-amber-500"
              />
            </div>
          )}
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-neutral-400">Perícia de classe</span>
            {!editing ? (
              <span className="font-medium text-neutral-100">
                {skill.classSkill ? 'Sim' : 'Não'}
              </span>
            ) : (
              <Switch
                checked={skill.classSkill}
                onCheckedChange={() => trackedUpdate((c) => toggleSkillClass(c, skillKey))}
                label="Perícia de classe"
              />
            )}
          </div>
          {computed.classBonus > 0 && (
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-neutral-400">Bônus de classe</span>
              <span className="font-medium text-amber-400">+{computed.classBonus}</span>
            </div>
          )}
        </div>

        <div className="pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              Modificadores variados
            </p>
            {editing && (
              <button
                type="button"
                onClick={() => trackedUpdate((c) => addSkillMod(c, skillKey))}
                className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400"
              >
                + Adicionar
              </button>
            )}
          </div>
          {skill.mods.length === 0 && (
            <p className="text-xs text-neutral-600">Nenhum modificador variado.</p>
          )}
          {!editing ? (
            <div className="flex flex-col divide-y divide-neutral-800/70">
              {skill.mods.map((m) => (
                <VariedModRowView key={m.id} label={m.label} value={m.value} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {skill.mods.map((m) => (
                <VariedModRowEdit
                  key={m.id}
                  label={m.label}
                  value={m.value}
                  onLabelChange={(label) =>
                    trackedUpdate((c) => updateSkillMod(c, skillKey, m.id, { label }))
                  }
                  onValueChange={(value) =>
                    trackedUpdate((c) => updateSkillMod(c, skillKey, m.id, { value }))
                  }
                  onRemove={() => trackedUpdate((c) => removeSkillMod(c, skillKey, m.id))}
                />
              ))}
            </div>
          )}
        </div>

        {editing && isRemovable && (
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => setConfirmRemove(true)}
          >
            <Trash2 className="h-4 w-4 text-rose-400" strokeWidth={1.8} />
            Remover perícia
          </Button>
        )}
      </Popup>
      <UnsavedChangesDialog
        open={confirmingClose}
        onOpenChange={(o) => !o && cancelClose()}
        onSave={keepChanges}
        onDiscard={discardChanges}
      />
      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remover esta perícia?"
        message={`"${skill.name}" sai da ficha, junto com a graduação e os modificadores variados dela.`}
        confirmLabel="Remover"
        onConfirm={() => {
          update((c) => removeSkill(c, skillKey));
          setConfirmRemove(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
