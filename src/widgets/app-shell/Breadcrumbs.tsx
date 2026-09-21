import { Fragment, type ReactNode } from 'react';

export interface Crumb {
  label: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  items: Crumb[];
  /** Extra content appended after the trail (used by the sheet for the back arrow row). */
  trailing?: ReactNode;
}

/** Horizontal breadcrumb trail; scrolls instead of wrapping on narrow screens. */
export function Breadcrumbs({ items, trailing }: BreadcrumbsProps) {
  return (
    <div className="no-scrollbar mb-4 flex items-center gap-2 overflow-x-auto text-xs whitespace-nowrap text-neutral-500">
      {items.map((item, i) => (
        // The trail is a fixed, non-reorderable list rebuilt fresh each render — index is a stable key here.
        // eslint-disable-next-line react-x/no-array-index-key
        <Fragment key={item.label + i}>
          {i > 0 && <span className="shrink-0">/</span>}
          {item.onClick ? (
            <button type="button" onClick={item.onClick} className="shrink-0 hover:text-amber-400">
              {item.label}
            </button>
          ) : (
            <span className="shrink-0 text-neutral-300">{item.label}</span>
          )}
        </Fragment>
      ))}
      {trailing}
    </div>
  );
}
