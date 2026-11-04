import { useState } from 'react';
import type { SpellLibraryItem } from '@/entities/library-item/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';
import { parseNumberInput } from '@/shared/lib/parseNumberInput';

export interface SpellLibraryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fills the form — editing an existing item in place, or (see `editing` below) a starting
   * point for a brand-new translation of one. */
  initial?: Omit<SpellLibraryItem, 'id' | 'locale' | 'groupId'>;
  /** Whether `initial` means "editing this row in place" vs. "prefilled starting point for a new
   * row" (LibraryPage's add-translation flow also passes `initial`, but submitting there creates
   * a new item) — explicit rather than inferred from `initial !== undefined` so the two can't be
   * confused. Defaults to `initial !== undefined` for callers that only ever edit. */
  editing?: boolean;
  onSubmit: (spell: Omit<SpellLibraryItem, 'id' | 'locale' | 'groupId'>) => void;
}

const blank = {
  name: '',
  school: '',
  circle: 0,
  castTime: '',
  range: '',
  duration: '',
  resistance: '',
  desc: '',
};

/** "Cadastrar nova magia na biblioteca" (or "Editar magia", when `initial` is given) — magias
 * never had a rich create form anywhere before this (the sheet's own `SpellPickDialog` only
 * picks an existing library entry, it never creates one), so unlike
 * FeatLibraryAddDialog/WeaponLibraryAddDialog this isn't a generalization of something that
 * already existed. Library-only: there's no "add to sheet" variant, since nothing in the sheet
 * creates a brand new magia this way (only picks one already in the library). */
export function SpellLibraryFormDialog({
  open,
  onOpenChange,
  initial,
  editing = initial !== undefined,
  onSubmit,
}: SpellLibraryFormDialogProps) {
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
      title={editing ? 'Editar magia' : 'Nova magia na biblioteca'}
      size="md"
      footer={
        <Button className="w-full" onClick={handleSubmit}>
          {editing ? 'Salvar alterações' : 'Salvar na biblioteca'}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <TextField
          label="Nome"
          placeholder="Ex: Bola de Fogo"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Escola"
            placeholder="Ex: Evocação"
            value={form.school}
            onChange={(e) => set('school', e.target.value)}
          />
          <TextField
            label="Círculo (0 = truque)"
            type="number"
            value={form.circle}
            onChange={(e) => {
              const value = parseNumberInput(e.target.value);
              if (value !== null) set('circle', Math.max(0, value));
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Tempo de conjuração"
            placeholder="Ex: 1 ação padrão"
            value={form.castTime}
            onChange={(e) => set('castTime', e.target.value)}
          />
          <TextField
            label="Alcance"
            placeholder="Ex: Médio"
            value={form.range}
            onChange={(e) => set('range', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Duração"
            placeholder="Ex: 1 rodada/nível"
            value={form.duration}
            onChange={(e) => set('duration', e.target.value)}
          />
          <TextField
            label="Resistência"
            placeholder="Ex: Reflexos parcial"
            value={form.resistance}
            onChange={(e) => set('resistance', e.target.value)}
          />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-400">Descrição</span>
          <textarea
            rows={3}
            placeholder="O que esta magia faz..."
            value={form.desc}
            onChange={(e) => set('desc', e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 outline-none focus:border-amber-500"
          />
        </label>
      </div>
    </Popup>
  );
}
