import { useState } from 'react';
import type { FeatLibraryItem } from '@/entities/library-item/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';

export interface FeatLibraryAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feat: Omit<FeatLibraryItem, 'id'>) => void;
}

const initial = { name: '', tag: 'Talento', prerequisite: '', benefit: '', desc: '' };

/** "Cadastrar novo talento na biblioteca" — unlike the other categories' generic
 * AddLibraryItemDialog (name+desc only), talentos need their own form: tag, prerequisite and
 * benefit are talento-specific fields, same reasoning as WeaponLibraryAddDialog/SpecialPickDialog's
 * own dedicated add forms for their categories. */
export function FeatLibraryAddDialog({ open, onOpenChange, onSubmit }: FeatLibraryAddDialogProps) {
  const [form, setForm] = useState(initial);
  const set = <K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({ ...form, name: form.name.trim() });
    setForm(initial);
  };

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title="Novo talento na biblioteca"
      size="md"
      footer={
        <Button className="w-full" onClick={handleSubmit}>
          Salvar na biblioteca e adicionar à ficha
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-[11px] text-neutral-600">
          O talento fica disponível para todos os jogadores na biblioteca compartilhada e é
          adicionado à sua ficha.
        </p>
        <TextField
          label="Nome"
          placeholder="Ex: Ataque Poderoso"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <TextField
          label="Tag"
          placeholder="Ex: Talento de combate"
          value={form.tag}
          onChange={(e) => set('tag', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Pré-requisito"
            placeholder="Ex: Força 13"
            value={form.prerequisite}
            onChange={(e) => set('prerequisite', e.target.value)}
          />
          <TextField
            label="Benefício"
            placeholder="Ex: +1 no dano corpo a corpo"
            value={form.benefit}
            onChange={(e) => set('benefit', e.target.value)}
          />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-400">
            Descrição{' '}
            <span className="text-neutral-600">(suporta markdown: **negrito** e tabelas)</span>
          </span>
          <textarea
            rows={3}
            placeholder="O que este talento faz..."
            value={form.desc}
            onChange={(e) => set('desc', e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 outline-none focus:border-amber-500"
          />
        </label>
      </div>
    </Popup>
  );
}
