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
