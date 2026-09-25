import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { Button } from '@/shared/ui/atoms/Button';
import { cn } from '@/shared/lib/cn';
import { withLevelUpSnapshot } from '@/entities/character/model/snapshots';
import { levelUpClass } from '../model/mutations';
import { ClassPickerDialog } from './ClassPickerDialog';

export interface LevelUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

export function LevelUpDialog({ open, onOpenChange, character, update }: LevelUpDialogProps) {
  const [selected, setSelected] = useState<string | null>(character.classes[0]?.name ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <Popup open={open} onOpenChange={onOpenChange} title="Upar de nível" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-neutral-500">
            Escolha em qual classe o próximo nível efetivo entra. Só é possível subir 1 nível
            efetivo por vez.
          </p>
          <div className="flex flex-col gap-2">
            {character.classes.map((cls) => {
              const isSelected = selected === cls.name;
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => setSelected(cls.name)}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition',
                    isSelected
                      ? 'border border-amber-700/50 bg-amber-950/40 text-neutral-100'
                      : 'border border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700',
                  )}
                >
                  <span>
                    {cls.name}{' '}
                    <span className="text-neutral-500">
                      nível {cls.level} → {cls.level + 1}
                    </span>
                  </span>
                  {isSelected && <span className="text-amber-400">✓</span>}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-dashed border-neutral-700 px-4 py-3 text-left text-sm text-neutral-500 transition hover:border-amber-600 hover:text-amber-400"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Nova classe (nível 1)
            </button>
          </div>
          <Button
            disabled={!selected}
            onClick={() => {
              if (selected) update(withLevelUpSnapshot((c) => levelUpClass(c, selected)));
              onOpenChange(false);
            }}
          >
            Confirmar +1 nível
          </Button>
        </div>
      </Popup>

      <ClassPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        character={character}
        update={update}
        onAdded={() => onOpenChange(false)}
      />
    </>
  );
}
