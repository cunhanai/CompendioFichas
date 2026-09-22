import { useState } from 'react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';

export function AddEquipmentDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: { name: string; qty: number; unitWeight: number }) => void;
}) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [unitWeight, setUnitWeight] = useState(0);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), qty, unitWeight });
    setName('');
    setQty(1);
    setUnitWeight(0);
  };

  return (
    <Popup open={open} onOpenChange={onOpenChange} title="Novo equipamento" size="sm">
      <div className="flex flex-col gap-3">
        <TextField label="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Quantidade"
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value) || 0)}
          />
          <TextField
            label="Peso unitário (kg)"
            type="number"
            step={0.01}
            value={unitWeight}
            onChange={(e) => setUnitWeight(Number(e.target.value) || 0)}
          />
        </div>
        <Button onClick={submit}>Adicionar</Button>
      </div>
    </Popup>
  );
}
