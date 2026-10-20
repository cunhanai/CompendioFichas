import { ArchiveRestore } from 'lucide-react';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { Button } from '@/shared/ui/atoms/Button';
import { daysRemainingInTrash } from '../model/trash';
import type { DeletedCharacterSummary } from '../model/types';

export interface DeletedCharacterRowProps {
  character: DeletedCharacterSummary;
  /** Extra text shown alongside the retention countdown — e.g. the owner's @usuário and system,
   * only meaningful in the master's cross-user trash view. */
  subtitle?: string;
  restoring: boolean;
  onRestore: () => void;
}

/** One row in a trash list ("Lixeira") — shared by the owner's own trash (`TrashDialog`) and the
 * master's cross-user trash (`DeletedCharactersPanel`), which otherwise differ only in what they
 * fetch and this row's optional `subtitle`. */
export function DeletedCharacterRow({
  character,
  subtitle,
  restoring,
  onRestore,
}: DeletedCharacterRowProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-neutral-950 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm text-neutral-200">{character.name}</p>
          <p className="truncate text-xs text-neutral-500">
            {subtitle && `${subtitle} · `}
            Restam {daysRemainingInTrash(character.deletedAt)} dias na lixeira
          </p>
        </div>
      </div>
      <Button size="sm" variant="secondary" disabled={restoring} onClick={onRestore}>
        <ArchiveRestore className="h-3.5 w-3.5" strokeWidth={1.8} />
        Restaurar
      </Button>
    </div>
  );
}
