import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { cn } from '@/shared/lib/cn';

/** Renders Markdown for free-text description fields — bold and tables (via remark-gfm), plus
 * single line breaks turned into actual breaks (remark-breaks) so existing plain-text
 * descriptions written before this component existed (where every `\n` was just a line break,
 * not a new paragraph) keep rendering the same way. Component overrides below only restyle what
 * Tailwind's preflight reset strips (table borders, list bullets) — everything else renders with
 * its normal tag and inherits surrounding text color.
 *
 * `className` merges onto the outer wrapper — e.g. a `line-clamp-N` preview (GeralTab's story
 * card) applies it here directly, instead of to a plain `<p>`, so bold/italic markdown renders
 * as real `<strong>`/`<em>` (inline, so the clamp still truncates the same way) in the preview
 * too, not just inside the full-text dialog. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={cn('text-sm leading-relaxed text-neutral-300 [&>*:last-child]:mb-0', className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          p: ({ children }) => <p className="mb-2">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal pl-5">{children}</ol>,
          table: ({ children }) => (
            <div className="mb-2 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-neutral-700">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1 font-semibold text-neutral-200">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-t border-neutral-800 px-2 py-1">{children}</td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
