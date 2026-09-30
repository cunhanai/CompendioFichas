import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Trash2, Upload } from 'lucide-react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { IconButton } from '@/shared/ui/atoms/IconButton';
import { useAppToast } from '@/shared/ui/organisms';
import { api, ApiError } from '@/shared/lib/api';
import { resizeImageKeepingAspect } from '@/shared/lib/image';
import type { CharacterPhoto } from '@/entities/character/model/types';

export interface PhotoGalleryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterId: string;
  /** Read-only shared viewers can browse the gallery but not add or remove photos. */
  canEdit: boolean;
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

/**
 * A character's photo gallery — separate from the single avatar (`photoUrl`, edited via
 * `PhotoUploadDialog`). Loaded lazily (only while this dialog is open) from its own endpoint
 * rather than riding along with the character object; see the comment on `CharacterPhoto` in
 * entities/character/model/types.ts for why that separation matters here specifically.
 */
export function PhotoGalleryDialog({
  open,
  onOpenChange,
  characterId,
  canEdit,
}: PhotoGalleryDialogProps) {
  const toast = useAppToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<CharacterPhoto[] | null>(null);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Guards against an earlier fetch (e.g. from a fast close+reopen, or a characterId change
  // while open) resolving after a later one and clobbering it with stale photos.
  const fetchSeq = useRef(0);

  useEffect(() => {
    if (!open) return;
    const seq = ++fetchSeq.current;
    api
      .get<{ photos: CharacterPhoto[] }>(`/characters/${characterId}/photos`)
      .then(({ photos: rows }) => {
        if (seq === fetchSeq.current) setPhotos(rows);
      })
      .catch((err: unknown) => {
        if (seq !== fetchSeq.current) return;
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível carregar a galeria.');
        setPhotos([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, characterId]);

  // Resets the dialog's own state on close (rather than in the effect above, which would mean
  // calling setState synchronously during an effect just to react to `open` flipping) so the next
  // open always starts from a clean loading state instead of briefly showing last time's photos.
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setPhotos(null);
      setViewingIndex(null);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      toast.error('Formato não suportado. Envie um PNG, JPG, WEBP ou GIF.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('Essa imagem é muito grande. O limite é 8 MB.');
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await resizeImageKeepingAspect(file);
      const { photos: rows } = await api.post<{ photos: CharacterPhoto[] }>(
        `/characters/${characterId}/photos`,
        { dataUrl },
      );
      setPhotos(rows);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : err instanceof Error && err.message === 'Failed to load image'
            ? 'Esse arquivo não é uma imagem válida.'
            : 'Não foi possível adicionar a foto.',
      );
    } finally {
      setUploading(false);
    }
  };

  const removeCurrent = async () => {
    if (viewingIndex === null || !photos) return;
    const photo = photos[viewingIndex];
    setConfirmDelete(false);
    try {
      const { photos: rows } = await api.delete<{ photos: CharacterPhoto[] }>(
        `/characters/${characterId}/photos/${photo.id}`,
      );
      setPhotos(rows);
      setViewingIndex(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível remover a foto.');
    }
  };

  const viewing = viewingIndex !== null ? (photos?.[viewingIndex] ?? null) : null;
  const title =
    viewing && viewingIndex !== null
      ? `Foto ${viewingIndex + 1} de ${photos?.length ?? 0}`
      : 'Galeria de fotos';

  return (
    <>
      <Popup open={open} onOpenChange={handleOpenChange} title={title} size="lg">
        {viewing ? (
          <div className="flex flex-col gap-3">
            <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-neutral-950">
              <img src={viewing.dataUrl} alt="" className="max-h-[60vh] w-full object-contain" />
              {photos && photos.length > 1 && (
                <>
                  <IconButton
                    label="Foto anterior"
                    variant="neutral"
                    className="absolute top-1/2 left-2 -translate-y-1/2"
                    onClick={() =>
                      setViewingIndex((i) => ((i ?? 0) - 1 + photos.length) % photos.length)
                    }
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                  </IconButton>
                  <IconButton
                    label="Próxima foto"
                    variant="neutral"
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                    onClick={() => setViewingIndex((i) => ((i ?? 0) + 1) % photos.length)}
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </IconButton>
                </>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setViewingIndex(null)}
                className="text-xs font-medium text-neutral-400 hover:text-neutral-200"
              >
                Voltar para a galeria
              </button>
              {canEdit && (
                <IconButton
                  label="Remover foto"
                  variant="danger"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </IconButton>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {photos === null ? (
              <p className="col-span-full py-6 text-center text-xs text-neutral-500">Carregando…</p>
            ) : (
              <>
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setViewingIndex(i)}
                    className="aspect-square overflow-hidden rounded-lg bg-neutral-950 transition hover:opacity-80"
                  >
                    <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
                {canEdit && (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-neutral-700 text-neutral-500 transition hover:border-amber-600 hover:text-amber-400 disabled:opacity-50"
                  >
                    {uploading ? (
                      <Upload className="h-5 w-5 animate-pulse" strokeWidth={1.6} />
                    ) : (
                      <ImagePlus className="h-5 w-5" strokeWidth={1.6} />
                    )}
                    <span className="text-[11px]">Adicionar</span>
                  </button>
                )}
                {photos.length === 0 && !canEdit && (
                  <p className="col-span-full py-6 text-center text-xs text-neutral-500">
                    Nenhuma foto ainda.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </Popup>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Remover esta foto?"
        message="Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        onConfirm={removeCurrent}
      />
    </>
  );
}
