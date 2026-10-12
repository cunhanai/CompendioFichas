import { useState } from 'react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';

export interface EditEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: { name: string; qty: number; unitWeight: number };
  onSubmit: (item: { name: string; qty: number; unitWeight: number }) => void;
}

/** Edits an existing equipment item in place — a sibling of AddEquipmentDialog, kept separate
 * (rather than one dialog toggling between add/edit modes) since InventarioTab only ever mounts
 * this one per edit session (it closes and unmounts between items), so its local state can seed
 * straight from `item` without needing to resync on every reopen. */
export function EditEquipmentDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
}: EditEquipmentDialogProps) {
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(item.qty);
  const [unitWeight, setUnitWeight] = useState(item.unitWeight);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), qty, unitWeight });
  };

  return (
    <Popup open={open} onOpenChange={onOpenChange} title="Editar equipamento" size="sm">
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
        <Button onClick={submit}>Salvar</Button>
      </div>
    </Popup>
  );
}
