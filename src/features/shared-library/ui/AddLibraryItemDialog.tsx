import { useState } from 'react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';

export interface AddLibraryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: { name: string; desc: string }) => void;
}

/** Generic "Novo item" form (name + description) reused by every library category. */
export function AddLibraryItemDialog({ open, onOpenChange, onSubmit }: AddLibraryItemDialogProps) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), desc: desc.trim() });
    setName('');
    setDesc('');
  };

  return (
    <Popup open={open} onOpenChange={onOpenChange} title="Novo item na biblioteca" size="md">
      <div className="flex flex-col gap-4">
        <TextField
          label="Nome"
          placeholder="Nome do item"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-400">Descrição</span>
          <textarea
            rows={3}
            placeholder="O que este item faz..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 outline-none focus:border-amber-500"
          />
        </label>
        <Button onClick={handleSubmit}>Salvar na biblioteca</Button>
      </div>
    </Popup>
  );
}
