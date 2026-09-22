import { useState } from 'react';
import type { Character } from '@/entities/character/model/types';
import { computeAc, computeAllAbilities } from '@/entities/character/model/calculations';
import { Popup } from '@/shared/ui/organisms/Popup';
import { PillTabs } from '@/shared/ui/molecules/PillTabs';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { VariedDot } from '@/shared/ui/atoms/VariedDot';
import { VariedModRowEdit } from '@/shared/ui/molecules/VariedModRow';
import {
  addAcVariedMod,
  removeAcVariedMod,
  setAcField,
  updateAcVariedMod,
} from '../model/mutations';

export interface AcDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
  initialTab?: 'total' | 'touch' | 'flat';
}

const FIELD_LABEL: Record<'acArmor' | 'acShield' | 'acNatural' | 'acDeflection', string> = {
  acArmor: 'Armadura',
  acShield: 'Escudo',
  acNatural: 'Armadura natural',
  acDeflection: 'Deflexão',
};

export function AcDialog({
  open,
  onOpenChange,
  character,
  update,
  initialTab = 'total',
}: AcDialogProps) {
  const [tab, setTab] = useState<'total' | 'touch' | 'flat'>(initialTab);
  const [editing, setEditing] = useState(false);

  const ac = computeAc(character, computeAllAbilities(character.abilities));
  const data = { total: ac.total, touch: ac.touch, flat: ac.flat }[tab];
  const rows = ac.rows[tab];

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title="Classe de Armadura"
      size="md"
      headerActions={<EditToggleButton editing={editing} onToggle={() => setEditing((e) => !e)} />}
      tabs={
        <PillTabs
          value={tab}
          onValueChange={setTab}
          options={[
            { value: 'total', label: 'CA' },
            { value: 'touch', label: 'CA de Toque' },
            { value: 'flat', label: 'CA Desprevenido' },
          ]}
        />
      }
    >
      <p className="mb-3 text-3xl font-bold text-neutral-100">{data}</p>
      {!editing || tab !== 'total' ? (
        <div className="flex flex-col divide-y divide-neutral-800/70">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2 text-sm">
              <span className="flex items-center gap-2 text-neutral-400">
                {row.varied && <VariedDot />}
                {row.label}
              </span>
              <span className="font-medium text-neutral-100">{row.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-neutral-800/70">
          <div className="flex items-center justify-between py-2.5 text-sm">
            <span className="text-neutral-400">Base</span>
            <span className="font-medium text-neutral-100">10</span>
          </div>
          {(['acArmor', 'acShield', 'acNatural', 'acDeflection'] as const).map((field) => (
            <div key={field} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="shrink-0 text-neutral-400">{FIELD_LABEL[field]}</span>
              <input
                type="number"
                value={character[field]}
                onChange={(e) => update((c) => setAcField(c, field, Number(e.target.value) || 0))}
                className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-neutral-100 outline-none focus:border-amber-500"
              />
            </div>
          ))}
          <div className="py-2.5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-neutral-400">Variado</span>
              <button
                type="button"
                onClick={() => update(addAcVariedMod)}
                className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400"
              >
                + Adicionar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {character.acVariedMods.map((m) => (
                <VariedModRowEdit
                  key={m.id}
                  label={m.label}
                  value={m.value}
                  onLabelChange={(label) => update((c) => updateAcVariedMod(c, m.id, { label }))}
                  onValueChange={(value) => update((c) => updateAcVariedMod(c, m.id, { value }))}
                  onRemove={() => update((c) => removeAcVariedMod(c, m.id))}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
}
