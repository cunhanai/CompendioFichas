import { api } from '@/shared/lib/api';

/** Soft-delete retention — informational only today (see DESIGN_NOTES.md, "Exclusão de ficha de
 * personagem"): nothing actually purges a row once this reaches 0, by explicit product decision.
 * Shared between the owner's trash dialog and the master's cross-user trash panel so the two
 * never drift apart if this number ever changes. */
export const RETENTION_DAYS = 90;

export function daysRemainingInTrash(deletedAt: string): number {
  const elapsedMs = Date.now() - new Date(deletedAt).getTime();
  const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
  return Math.max(0, RETENTION_DAYS - elapsedDays);
}

/** Confirmation copy for permanently deleting a trashed character — shared between `TrashDialog`
 * (owner's own trash) and `DeletedCharactersPanel` (master's cross-user trash) so the two never
 * drift apart, same reasoning as `RETENTION_DAYS` above. */
export const HARD_DELETE_CONFIRM_TITLE = 'Excluir esta ficha definitivamente?';
export const HARD_DELETE_CONFIRM_MESSAGE =
  'Não tem volta — a ficha e tudo que ela tem (itens, histórico, fotos) são apagados pra sempre, não só movidos pra lixeira.';

/** Permanently deletes a character already in the trash — master-only (enforced server-side).
 * Same endpoint regardless of whether the viewer reached it through their own trash
 * (`TrashDialog`) or the master's cross-user trash (`DeletedCharactersPanel`): hard delete isn't
 * owner-scoped, so there's only ever one way to do it. */
export async function hardDeleteCharacter(id: string): Promise<void> {
  await api.delete(`/admin/users/deleted-characters/${id}`, { permanent: true });
}
