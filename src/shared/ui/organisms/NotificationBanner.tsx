import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const bannerVariants = cva('flex items-start justify-between gap-3 border-b px-5 py-3 md:px-10', {
  variants: {
    tone: {
      neutral: 'border-neutral-800/50 bg-neutral-900/30',
      amber: 'border-amber-900/50 bg-amber-950/30',
      emerald: 'border-emerald-900/50 bg-emerald-950/30',
      rose: 'border-rose-900/50 bg-rose-950/30',
      sky: 'border-sky-900/50 bg-sky-950/30',
      violet: 'border-violet-900/50 bg-violet-950/30',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

const toneText = {
  neutral: { icon: 'text-neutral-400', message: 'text-neutral-200', time: 'text-neutral-500/70' },
  amber: { icon: 'text-amber-400', message: 'text-amber-200', time: 'text-amber-400/70' },
  emerald: { icon: 'text-emerald-400', message: 'text-emerald-200', time: 'text-emerald-400/70' },
  rose: { icon: 'text-rose-400', message: 'text-rose-200', time: 'text-rose-400/70' },
  sky: { icon: 'text-sky-400', message: 'text-sky-200', time: 'text-sky-400/70' },
  violet: { icon: 'text-violet-400', message: 'text-violet-200', time: 'text-violet-400/70' },
} satisfies Record<
  NonNullable<VariantProps<typeof bannerVariants>['tone']>,
  Record<string, string>
>;

export interface NotificationBannerProps extends VariantProps<typeof bannerVariants> {
  icon: LucideIcon;
  message: string;
  timestamp: string;
  onDismiss: () => void;
  /** When set, the banner becomes clickable — used to route to wherever this notification is
   * "about" (e.g. an admin security alert opens the activity log). Different notification kinds
   * can point at different places without this component knowing about any of them. */
  onClick?: () => void;
}

/** Generic, dismissible, persistent banner — the shared shell for every "standing notification"
 * in the app (currently just admin security alerts, but built to take more kinds later: a
 * different tone/icon/message per kind, and a different onClick per kind, all decided by the
 * caller). Rendered at the app-shell level so it shows on every page, not just one screen. */
export function NotificationBanner({
  tone,
  icon: Icon,
  message,
  timestamp,
  onDismiss,
  onClick,
}: NotificationBannerProps) {
  const colors = toneText[tone ?? 'neutral'];
  return (
    <div
      className={cn(bannerVariants({ tone }), onClick && 'cursor-pointer')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
    >
      <div className="flex items-start gap-2.5">
        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', colors.icon)} strokeWidth={1.8} />
        <div>
          <p className={cn('text-sm', colors.message)}>{message}</p>
          <p className={cn('text-[11px]', colors.time)}>{timestamp}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        aria-label="Remover notificação"
        className={cn('shrink-0 transition hover:opacity-80', colors.icon)}
      >
        <X className="h-4 w-4" strokeWidth={1.8} />
      </button>
    </div>
  );
}
