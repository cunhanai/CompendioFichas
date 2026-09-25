import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** Formats a number with an explicit sign, e.g. 3 -> "+3", -2 -> "-2", 0 -> "+0". */
export function signed(n: number): string {
  return (n >= 0 ? '+' : '') + n;
}

/** "há 2 horas", "há 1 dia"... — used for the dashboard's recently-accessed list. */
export function formatRelativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
}

/**
 * Joins non-empty parts with " · ", dropping empty/blank ones instead of leaving a stray
 * separator — e.g. a brand-new character with no race/class yet shouldn't show "· · Nível 1".
 */
export function joinDot(parts: (string | null | undefined)[]): string {
  return parts.filter((p): p is string => Boolean(p && p.trim())).join(' · ');
}
