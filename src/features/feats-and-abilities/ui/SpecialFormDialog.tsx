import { useState } from 'react';
import type { SpecialLibraryItem } from '@/entities/library-item/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Switch } from '@/shared/ui/atoms/Switch';
import { Button } from '@/shared/ui/atoms/Button';

export interface SpecialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fills the form — from LibraryPage, either editing an existing library item in place, or
   * (see `editing` below) pre-filling a new translation from an existing one. Never set from the
   * sheet's own "criar nova habilidade" flow, which always creates fresh (see `showShareToggle`
   * below). */
  initial?: Omit<SpecialLibraryItem, 'id' | 'locale' | 'groupId'>;
  /** Whether `initial` (when given) means "editing this row in place" (title/button read
   * accordingly) as opposed to "prefilled starting point for a brand-new row" (LibraryPage's
   * add-translation flow also passes `initial`, but submitting there creates a new item, not an
   * edit) — kept as an explicit flag rather than inferred from `initial !== undefined` so the
   * two cases can't be confused. Defaults to `initial !== undefined` for callers that only ever
   * use `initial` for real edits. */
  editing?: boolean;
  /** True from the sheet's "criar nova habilidade" flow (TalentosTab/SpecialPickDialog), which
   * shows the "Compartilhar na biblioteca" switch and reports the player's choice back via
   * `onSubmit`'s second argument. False from LibraryPage, which has no character to add to and
   * always means the library copy — the switch is hidden and that argument is unused. */
  showShareToggle?: boolean;
  onSubmit: (
    special: Omit<SpecialLibraryItem, 'id' | 'locale' | 'groupId'>,
    shareToLibrary: boolean,
  ) => void;
}

const blank = {
  name: '',
  subtitle: '',
  uses: '',
  resumo: '',
  fonte: '',
  desc: '',
};

/** Single "criar/editar habilidade especial" form, replacing the old split between "puxar da
 * biblioteca" + a separate silently-character-only "criar avulsa" shortcut (which opened a
 * blank character detail dialog with no explanation of where the data would end up). Used both
 * by LibraryPage (editing/creating a pure library entry, no toggle) and by the sheet's "criar
 * nova habilidade" flow (SpecialPickDialog's footer button, with the toggle) — see
 * `showShareToggle`. */
export function SpecialFormDialog({
  open,
  onOpenChange,
  initial,
  editing = initial !== undefined,
  showShareToggle = false,
  onSubmit,
}: SpecialFormDialogProps) {
  const [form, setForm] = useState(initial ?? blank);
  const [shareToLibrary, setShareToLibrary] = useState(true);
  const set = <K extends keyof typeof blank>(key: K, value: (typeof blank)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({ ...form, name: form.name.trim() }, shareToLibrary);
    if (!editing) {
      setForm(blank);
      setShareToLibrary(true);
    }
  };

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? 'Editar habilidade' : 'Nova habilidade especial'}
      size="md"
      footer={
        <Button className="w-full" onClick={handleSubmit}>
          {editing ? 'Salvar alterações' : 'Salvar'}
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <TextField
          label="Nome"
          placeholder="Ex: Visão no escuro"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <TextField
          label="Resumo"
          placeholder="Prévia curta mostrada no card da lista"
          value={form.resumo}
          onChange={(e) => set('resumo', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Origem"
            placeholder="Ex: Racial, Clériga"
            value={form.subtitle}
            onChange={(e) => set('subtitle', e.target.value)}
          />
          <TextField
            label="Usos"
            placeholder="Ex: 3/dia"
            value={form.uses}
            onChange={(e) => set('uses', e.target.value)}
          />
        </div>
        <TextField
          label="Fonte"
          placeholder="Ex: Livro básico, ou um link (d20pf1e, etc.)"
          value={form.fonte}
          onChange={(e) => set('fonte', e.target.value)}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-400">Descrição</span>
          <textarea
            rows={4}
            placeholder="O que esta habilidade faz..."
            value={form.desc}
            onChange={(e) => set('desc', e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 outline-none focus:border-amber-500"
          />
        </label>
        {showShareToggle && (
          <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2.5">
            <div>
              <span className="block text-sm text-neutral-300">Compartilhar na biblioteca</span>
              <span className="block text-[11px] text-neutral-600">
                Outros jogadores poderão puxar essa habilidade pros personagens deles. Desligado,
                ela fica só nesta ficha.
              </span>
            </div>
            <Switch
              checked={shareToLibrary}
              onCheckedChange={setShareToLibrary}
              label="Compartilhar na biblioteca"
            />
          </div>
        )}
      </div>
    </Popup>
  );
}
