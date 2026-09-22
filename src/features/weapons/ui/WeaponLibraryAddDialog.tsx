import { useState } from 'react';
import type { WeaponLibraryItem } from '@/entities/library-item/model/types';
import { WEAPON_DAMAGE_TYPES } from '@/entities/character/model/constants';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Switch } from '@/shared/ui/atoms/Switch';
import { Button } from '@/shared/ui/atoms/Button';
import { cn } from '@/shared/lib/cn';

export interface WeaponLibraryAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (weapon: Omit<WeaponLibraryItem, 'id'>) => void;
}

const initial = {
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
  onSubmit,
}: WeaponLibraryAddDialogProps) {
  const [form, setForm] = useState(initial);
  const set = <K extends keyof typeof initial>(key: K, value: (typeof initial)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    onSubmit({ ...form, name: form.name.trim() || 'Nova arma' });
    setForm(initial);
  };

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title="Nova arma na biblioteca"
      size="md"
      footer={
        <Button className="w-full" onClick={handleSubmit}>
          Salvar na biblioteca e adicionar à ficha
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-[11px] text-neutral-600">
          A arma fica disponível para todos os jogadores na biblioteca compartilhada e é adicionada
          à sua ficha.
        </p>
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
            onChange={(e) => set('ammoMax', Number(e.target.value) || 0)}
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
