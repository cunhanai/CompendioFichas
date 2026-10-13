import { ExternalLink } from 'lucide-react';

export interface SourceLinkProps {
  value: string;
  className?: string;
}

const URL_PATTERN = /^https?:\/\//i;

/** Renders a "Fonte" field — plain text for a book name ("Livro básico"), or a clickable link
 * that opens in a new tab when the value looks like a URL (e.g. a d20pf1e page). */
export function SourceLink({ value, className }: SourceLinkProps) {
  if (!value) return null;
  if (!URL_PATTERN.test(value)) {
    return <span className={className}>{value}</span>;
  }
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 hover:underline ${className ?? ''}`}
    >
      {value}
      <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={2} />
    </a>
  );
}
