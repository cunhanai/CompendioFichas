import { useState } from 'react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';

export function AddArmorItemDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: {
    name: string;
    bonus: number;
    checkPenalty: number;
    arcaneFailure: number;
    weight: number;
  }) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    bonus: 0,
    checkPenalty: 0,
    arcaneFailure: 0,
    weight: 0,
  });
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.name.trim()) return;
    onSubmit({ ...form, name: form.name.trim() });
    setForm({ name: '', bonus: 0, checkPenalty: 0, arcaneFailure: 0, weight: 0 });
  };

  return (
    <Popup open={open} onOpenChange={onOpenChange} title="Novo item de CA" size="sm">
      <div className="flex flex-col gap-3">
        <TextField label="Nome" value={form.name} onChange={(e) => set('name', e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Bônus de CA"
            type="number"
            value={form.bonus}
            onChange={(e) => set('bonus', Number(e.target.value) || 0)}
          />
          <TextField
            label="Penalidade"
            type="number"
            value={form.checkPenalty}
            onChange={(e) => set('checkPenalty', Number(e.target.value) || 0)}
          />
          <TextField
            label="Falha arcana (%)"
            type="number"
            value={form.arcaneFailure}
            onChange={(e) => set('arcaneFailure', Number(e.target.value) || 0)}
          />
          <TextField
            label="Peso (kg)"
            type="number"
            step={0.1}
            value={form.weight}
            onChange={(e) => set('weight', Number(e.target.value) || 0)}
          />
        </div>
        <Button onClick={submit}>Adicionar</Button>
      </div>
    </Popup>
  );
}
