import { Popup } from '@/shared/ui/organisms/Popup';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { formatRelativeTime } from '@/shared/lib/format';
import type { DeletedCharacterSummary } from '../model/types';
import { daysRemainingInTrash } from '../model/trash';
import { HpBar } from './HpBar';

export interface DeletedCharacterViewDialogProps {
  character: DeletedCharacterSummary | null;
  /** Extra line shown below the retention countdown — the owner's @usuário, only meaningful in
   * the master's cross-user trash view (the owner's own trash already knows it's theirs). */
  subtitle?: string;
  onOpenChange: (open: boolean) => void;
}

/**
 * Read-only preview of a trashed character, opened by clicking its row in `TrashDialog`/
 * `DeletedCharactersPanel` — lets the viewer see who/what it is before deciding to
 * restore/permanently delete, without having to act on name + retention countdown alone.
 *
 * Deliberately not the full character sheet: a trashed character's classes/skills/spells/etc.
 * live in separate child tables that aren't loaded for the trash list (see
 * `DeletedCharacterSummary`'s own doc comment) — this shows the handful of fields already on
 * `characters` itself (name, race, HP, photo). A fuller view would need its own fetch and is a
 * bigger, separate piece of work if it turns out this isn't enough.
 */
export function DeletedCharacterViewDialog({
  character,
  subtitle,
  onOpenChange,
}: DeletedCharacterViewDialogProps) {
  return (
    <Popup open={character !== null} onOpenChange={onOpenChange} title="Ficha excluída" size="sm">
      {character && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={character.photoUrl} size="md" />
            <div className="min-w-0">
              <p className="font-display truncate text-lg text-neutral-100">{character.name}</p>
              <p className="truncate text-xs text-neutral-500">
                {character.raca || 'Raça não definida'}
              </p>
            </div>
          </div>
          <HpBar hpCurrent={character.hpCurrent} hpMax={character.hpMax} />
          <div className="rounded-lg bg-neutral-950 px-3.5 py-2.5 text-xs text-neutral-500">
            {subtitle && <p>{subtitle}</p>}
            <p>Excluída {formatRelativeTime(character.deletedAt)}</p>
            <p>Restam {daysRemainingInTrash(character.deletedAt)} dias na lixeira</p>
          </div>
        </div>
      )}
    </Popup>
  );
}
