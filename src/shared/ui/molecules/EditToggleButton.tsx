import { Pencil, Check } from 'lucide-react';
import { IconButton } from '@/shared/ui/atoms/IconButton';

export interface EditToggleButtonProps {
  editing: boolean;
  onToggle: () => void;
  label?: string;
}

/** Pencil icon that turns into a green checkmark while a popup's edit mode is on. */
export function EditToggleButton({ editing, onToggle, label = 'Editar' }: EditToggleButtonProps) {
  return (
    <IconButton label={label} variant={editing ? 'active' : 'neutral'} onClick={onToggle}>
      {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
    </IconButton>
  );
}
