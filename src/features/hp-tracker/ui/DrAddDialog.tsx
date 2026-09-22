import { useState } from 'react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Switch } from '@/shared/ui/atoms/Switch';
import { Button } from '@/shared/ui/atoms/Button';

export interface DrAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: { type: string; immune: boolean; amount: number }) => void;
}

export function DrAddDialog({ open, onOpenChange, onSubmit }: DrAddDialogProps) {
  const [type, setType] = useState('');
  const [immune, setImmune] = useState(false);
  const [amount, setAmount] = useState(5);

  const handleSubmit = () => {
    if (!type.trim()) return;
    onSubmit({ type: type.trim(), immune, amount });
    setType('');
    setImmune(false);
    setAmount(5);
  };

  return (
    <Popup open={open} onOpenChange={onOpenChange} title="Adicionar redução/imunidade" size="sm">
      <div className="flex flex-col gap-4">
        <TextField
          label="Tipo de dano"
          placeholder="Ex: Frio, Fogo, Elétrico..."
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-400">Imunidade</span>
            <div className="flex h-[38px] items-center justify-between rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2">
              <span className="text-sm text-neutral-300">{immune ? 'Sim' : 'Não'}</span>
              <Switch checked={immune} onCheckedChange={setImmune} label="Imunidade" />
            </div>
          </div>
          {!immune && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-400">Redução de dano</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="h-[38px] rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500"
              />
            </label>
          )}
        </div>
        <Button onClick={handleSubmit}>Adicionar</Button>
      </div>
    </Popup>
  );
}
