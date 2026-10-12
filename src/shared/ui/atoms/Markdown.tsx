import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

/** Renders Markdown for free-text description fields — bold and tables (via remark-gfm), plus
 * single line breaks turned into actual breaks (remark-breaks) so existing plain-text
 * descriptions written before this component existed (where every `\n` was just a line break,
 * not a new paragraph) keep rendering the same way. Component overrides below only restyle what
 * Tailwind's preflight reset strips (table borders, list bullets) — everything else renders with
 * its normal tag and inherits surrounding text color. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed text-neutral-300 [&>*:last-child]:mb-0">
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
