import { ChevronRight, Heart, Share2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { Badge } from '@/shared/ui/atoms/Badge';

export interface CharCardProps {
  name: string;
  subtitle: string;
  hpCurrent: number;
  hpMax: number;
  favorited?: boolean;
  active?: boolean;
  shared?: boolean;
  showStatusBadge?: boolean;
  showChevron?: boolean;
  onOpen: () => void;
  onShare?: () => void;
}

/**
 * Same card everywhere a character is listed (dashboard favorite spot, characters list) —
 * favorited uses the amber gradient + ring, otherwise flat neutral background.
 *
 * Rendered as a div-with-button-semantics (not a real <button>) because it can contain a
 * nested, independently clickable share button when `shared` is set.
 */
export function CharCard({
  name,
  subtitle,
  hpCurrent,
  hpMax,
  favorited,
  active,
  shared,
  showStatusBadge,
  showChevron,
  onOpen,
  onShare,
}: CharCardProps) {
  const pct = hpMax > 0 ? Math.round((hpCurrent / hpMax) * 100) : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        'flex w-full cursor-pointer items-center gap-5 rounded-2xl border p-5 text-left transition',
        favorited
          ? 'border-amber-800/40 bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 hover:border-amber-600/60'
          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700',
      )}
    >
      <Avatar tone={favorited ? 'amber' : 'neutral'} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display truncate text-lg text-neutral-100">{name}</h3>
          {showStatusBadge && (
            <Badge tone={active ? 'emerald' : 'neutral'} size="sm">
              {active ? 'Ativo' : 'Inativo'}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 text-xs text-neutral-500">{subtitle}</p>
        <div className="mt-3 flex max-w-xs items-center gap-2">
          <Heart className="h-4 w-4 shrink-0 text-rose-400" fill="currentColor" />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
            <div className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
          </div>
          <span className="shrink-0 text-xs text-neutral-400">
            {hpCurrent}/{hpMax}
          </span>
        </div>
      </div>
      {shared && (
        <button
          type="button"
          title="Compartilhado"
          onClick={(e) => {
            e.stopPropagation();
            onShare?.();
          }}
          className="shrink-0 text-sky-400 hover:text-sky-300"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.8} />
        </button>
      )}
      {showChevron && (
        <ChevronRight
          className="hidden h-5 w-5 shrink-0 text-neutral-600 sm:block"
          strokeWidth={1.8}
        />
      )}
    </div>
  );
}
