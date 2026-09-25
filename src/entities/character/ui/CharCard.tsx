import { ChevronRight, Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { Badge } from '@/shared/ui/atoms/Badge';

export interface CharCardProps {
  href: string;
  name: string;
  photoUrl?: string | null;
  subtitle: string;
  hpCurrent: number;
  hpMax: number;
  favorited?: boolean;
  active?: boolean;
  shared?: boolean;
  showStatusBadge?: boolean;
  showChevron?: boolean;
  onShare?: () => void;
}

/**
 * Same card everywhere a character is listed (dashboard favorite spot, characters list) —
 * favorited uses the amber gradient + ring, otherwise flat neutral background.
 *
 * The card is a real `<Link>` (stretched over the whole card via absolute positioning) so
 * ctrl/cmd/middle-click opens the sheet in a new tab like any other link — a plain
 * onClick+navigate div can't do that. The visible content sits above it, non-interactive, except
 * the independently-clickable share button, which needs its own stacking context to stay
 * clickable over the stretched link.
 */
export function CharCard({
  href,
  name,
  photoUrl,
  subtitle,
  hpCurrent,
  hpMax,
  favorited,
  active,
  shared,
  showStatusBadge,
  showChevron,
  onShare,
}: CharCardProps) {
  const pct = hpMax > 0 ? Math.round((hpCurrent / hpMax) * 100) : 0;

  return (
    <div
      className={cn(
        'relative flex w-full items-center gap-5 rounded-2xl border p-5 text-left transition',
        favorited
          ? 'border-amber-800/40 bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 hover:border-amber-600/60'
          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700',
      )}
    >
      <Link to={href} className="absolute inset-0 z-0 rounded-2xl" aria-label={name} />
      {/* `contents` drops this wrapper from layout (its children join the flex row directly)
          while still letting `pointer-events-none` cascade to them, so clicks fall through to
          the stretched Link above — without it, a `w-full` wrapper would eat the row's width
          and push the share button out of the flex layout. */}
      <div className="pointer-events-none relative z-10 contents">
        <Avatar src={photoUrl} tone={favorited ? 'amber' : 'neutral'} size="lg" />
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
      </div>
      {shared && (
        <button
          type="button"
          title="Compartilhado"
          onClick={onShare}
          className="relative z-20 shrink-0 text-sky-400 hover:text-sky-300"
        >
          <Share2 className="h-4 w-4" strokeWidth={1.8} />
        </button>
      )}
      {showChevron && (
        <ChevronRight
          className="pointer-events-none relative z-10 hidden h-5 w-5 shrink-0 text-neutral-600 sm:block"
          strokeWidth={1.8}
        />
      )}
    </div>
  );
}
