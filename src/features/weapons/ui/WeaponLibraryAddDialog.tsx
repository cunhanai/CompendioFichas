import { useState } from 'react';
import type { WeaponLibraryItem } from '@/entities/library-item/model/types';
import { WEAPON_DAMAGE_TYPES } from '@/entities/character/model/constants';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Switch } from '@/shared/ui/atoms/Switch';
import { Button } from '@/shared/ui/atoms/Button';
import { cn } from '@/shared/lib/cn';
import { parseNumberInput } from '@/shared/lib/parseNumberInput';

export interface WeaponLibraryAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fills the form — editing an existing item in place, or (see `editing` below) a starting
   * point for a brand-new translation of one. */
  initial?: Omit<WeaponLibraryItem, 'id' | 'locale' | 'groupId'>;
  /** Whether `initial` means "editing this row in place" vs. "prefilled starting point for a new
   * row" (LibraryPage's add-translation flow also passes `initial`, but submitting there creates
   * a new item) — explicit rather than inferred from `initial !== undefined` so the two can't be
   * confused. Defaults to `initial !== undefined` for callers that only ever edit. */
  editing?: boolean;
  /** False from LibraryPage, where there's no character to add the new arma to — only changes
   * the copy/button label, not what gets saved. Default true (the sheet's own flow). */
  addToSheet?: boolean;
  onSubmit: (weapon: Omit<WeaponLibraryItem, 'id' | 'locale' | 'groupId'>) => void;
}

const blank = {
  name: '',
  atk: '+0',
  crit: 'x2',
  dmg: '1d8',
  range: '— ou 24 m',
  type: 'Cortante',
  hasAmmo: false,
  ammoMax: 20,
  desc: '',
};

export function WeaponLibraryAddDialog({
  open,
  onOpenChange,
  initial,
  editing = initial !== undefined,
  addToSheet = true,
  onSubmit,
}: WeaponLibraryAddDialogProps) {
  const [form, setForm] = useState(initial ?? blank);
  const set = <K extends keyof typeof blank>(key: K, value: (typeof blank)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({ ...form, name: form.name.trim() });
    if (!editing) setForm(blank);
  };

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? 'Editar arma' : 'Nova arma na biblioteca'}
      size="md"
      footer={
        <Button className="w-full" onClick={handleSubmit}>
          {editing
            ? 'Salvar alterações'
            : addToSheet
              ? 'Salvar na biblioteca e adicionar à ficha'
              : 'Salvar na biblioteca'}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        {!editing && (
          <p className="text-[11px] text-neutral-600">
            A arma fica disponível para todos os jogadores na biblioteca compartilhada
            {addToSheet && ' e é adicionada à sua ficha'}.
          </p>
        )}
        <TextField
          label="Nome"
          placeholder="Ex: Besta leve"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Bônus de ataque"
            placeholder="+0"
            value={form.atk}
            onChange={(e) => set('atk', e.target.value)}
          />
          <TextField
            label="Crítico"
            placeholder="x2"
            value={form.crit}
            onChange={(e) => set('crit', e.target.value)}
          />
          <TextField
            label="Dano"
            placeholder="1d8"
            value={form.dmg}
            onChange={(e) => set('dmg', e.target.value)}
          />
          <TextField
            label="Alcance"
            placeholder="— ou 24 m"
            value={form.range}
            onChange={(e) => set('range', e.target.value)}
          />
        </div>
        <div>
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">Tipo de dano</span>
          <div className="flex flex-wrap gap-2">
            {WEAPON_DAMAGE_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('type', t)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs transition',
                  form.type === t
                    ? 'text-ink bg-amber-500 font-semibold'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200',
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2.5">
          <span className="text-sm text-neutral-300">Usa munição</span>
          <Switch
            checked={form.hasAmmo}
            onCheckedChange={(v) => set('hasAmmo', v)}
            label="Usa munição"
          />
        </div>
        {form.hasAmmo && (
          <TextField
            label="Munição máxima"
            type="number"
            value={form.ammoMax}
            onChange={(e) => {
              const value = parseNumberInput(e.target.value);
              if (value !== null) set('ammoMax', value);
            }}
          />
        )}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-400">Descrição</span>
          <textarea
            rows={2}
            placeholder="Propriedades, notas de uso..."
            value={form.desc}
            onChange={(e) => set('desc', e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 outline-none focus:border-amber-500"
          />
        </label>
      </div>
    </Popup>
  );
}
