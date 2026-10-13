import { Badge } from './Badge';

export type FeatureTagStatus = 'em-desenvolvimento' | 'novo';

const LABEL: Record<FeatureTagStatus, string> = {
  'em-desenvolvimento': 'Em desenvolvimento',
  novo: 'Novo',
};

const TONE: Record<FeatureTagStatus, 'amber' | 'emerald'> = {
  'em-desenvolvimento': 'amber',
  novo: 'emerald',
};

/** Badge marking a feature as still being built ("em desenvolvimento") or recently shipped
 * ("novo") — shown both next to its entry point and inside the feature itself. See
 * DESIGN_NOTES.md, "Sistema de changelog e tags de novidade". */
export function FeatureTag({
  status,
  className,
}: {
  status: FeatureTagStatus;
  className?: string;
}) {
  return (
    <Badge tone={TONE[status]} size="sm" className={className}>
      {LABEL[status]}
    </Badge>
  );
}
