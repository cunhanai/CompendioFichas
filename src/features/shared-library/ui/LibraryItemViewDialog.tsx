import { Popup } from '@/shared/ui/organisms/Popup';
import type { AnyLibraryItem, LibraryCategory } from '@/entities/library-item/model/types';
import { libraryItemFields } from '@/entities/library-item/model/selectors';

export interface LibraryItemViewDialogProps {
  category: LibraryCategory;
  item: AnyLibraryItem | null;
  onOpenChange: (open: boolean) => void;
}

/** Read-only preview of a library item, opened from `LibraryPage`'s trash view by clicking a
 * row — shows every field the item has (not just the name+desc summary the trash list itself
 * shows), so the admin can see what it actually is before deciding to restore/permanently
 * delete it. */
export function LibraryItemViewDialog({
  category,
  item,
  onOpenChange,
}: LibraryItemViewDialogProps) {
  return (
    <Popup open={item !== null} onOpenChange={onOpenChange} title="Item da lixeira" size="sm">
      {item && (
        <div className="flex flex-col gap-3">
          {libraryItemFields(category, item).map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium text-neutral-500">{field.label}</p>
              <p className="text-sm whitespace-pre-wrap text-neutral-200">{field.value || '—'}</p>
            </div>
          ))}
        </div>
      )}
    </Popup>
  );
}
