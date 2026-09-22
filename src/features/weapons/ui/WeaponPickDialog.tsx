import { Plus } from 'lucide-react';
import type { WeaponLibraryItem } from '@/entities/library-item/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { Button } from '@/shared/ui/atoms/Button';

export interface WeaponPickDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weapons: WeaponLibraryItem[];
  onPick: (weapon: WeaponLibraryItem) => void;
  onCreateNew: () => void;
}

export function WeaponPickDialog({
  open,
  onOpenChange,
  weapons,
  onPick,
  onCreateNew,
}: WeaponPickDialogProps) {
  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title="Puxar arma da biblioteca"
      size="md"
      footer={
        <button
          type="button"
          onClick={onCreateNew}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-neutral-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Não achei — cadastrar nova arma na biblioteca
        </button>
      }
    >
      <div className="flex flex-col gap-2">
        {weapons.map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between rounded-lg bg-neutral-950 px-4 py-3"
          >
            <div>
              <p className="text-sm text-neutral-200">{w.name}</p>
              <p className="text-[11px] text-neutral-500">
                {[
                  w.type,
                  w.dmg,
                  w.crit && `crítico ${w.crit}`,
                  w.range !== '—' && `alcance ${w.range}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="hover:text-ink text-amber-400 hover:bg-amber-500"
              onClick={() => onPick(w)}
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
            </Button>
          </div>
        ))}
      </div>
    </Popup>
  );
}
