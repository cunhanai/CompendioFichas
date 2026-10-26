import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Star, Trash2, Upload } from 'lucide-react';
import type { Area } from 'react-easy-crop';
import { useCharacter } from '@/app/providers';
import { MAX_CHARACTER_PHOTOS } from '@/entities/character/model/photoLimits';
import { setPhotoUrl } from '@/features/sheet-sharing';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { ImageCropDialog } from '@/shared/ui/organisms/ImageCropDialog';
import { IconButton } from '@/shared/ui/atoms/IconButton';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { useAppToast } from '@/shared/ui/organisms';
import { api, ApiError } from '@/shared/lib/api';
import { cropAndCompressImage } from '@/shared/lib/image';
import { SectionCard } from '@/shared/ui/molecules/SectionCard';
import type { CharacterPhoto } from '@/entities/character/model/types';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

/**
 * A character's photo gallery — capped at 3 photos, one of which doubles as the profile picture
 * (the avatar shown on the sheet header and the character list). A full sheet tab (not a dialog
 * opened from SheetHeader, as it used to be — PhotoGalleryDialog) so it fits the same navigation
 * pattern as every other section. Fetched on mount, same as the rest of the sheet's tabs loading
 * their own slice of data; still a separate endpoint from the character object itself (see the
 * comment on `CharacterPhoto` in entities/character/model/types.ts), just no longer gated behind
 * "dialog is open". A new photo goes through `ImageCropDialog` (pan/zoom crop) and
 * `cropAndCompressImage` (JPEG re-encode under a byte-size ceiling) before it's uploaded, so the
 * gallery can't quietly become "3 huge rows" in the database.
 */
export function FotosTab({ characterId }: { characterId: string }) {
  const { character, update, readOnly } = useCharacter(characterId);
  const canEdit = character.active && !readOnly;
  const toast = useAppToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<CharacterPhoto[] | null>(null);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [settingProfile, setSettingProfile] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingObjectUrl, setPendingObjectUrl] = useState<string | null>(null);
  // Guards against an earlier fetch (e.g. a fast tab-switch away and back) resolving after a
  // later one and clobbering it with stale photos. SheetPage renders this with key={characterId},
  // so a genuine character change remounts the whole tab (fresh state) rather than reusing it —
  // this guard is only for requests racing within the same mount.
  const fetchSeq = useRef(0);

  useEffect(() => {
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
  }, [characterId]);

  // Revokes the pending crop's blob URL whenever it's replaced by a new one, and on unmount —
  // cancelCrop/handleCropConfirm already revoke it on their own explicit paths, but neither runs
  // if the tab unmounts (e.g. switching characters) while a crop is still pending, which would
  // otherwise leak the blob for the rest of the page's lifetime.
  useEffect(() => {
    return () => {
      if (pendingObjectUrl) URL.revokeObjectURL(pendingObjectUrl);
    };
  }, [pendingObjectUrl]);

  const cancelCrop = () => {
    if (pendingObjectUrl) URL.revokeObjectURL(pendingObjectUrl);
    setPendingFile(null);
    setPendingObjectUrl(null);
  };

  const handleFile = (file: File | undefined) => {
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
    setPendingFile(file);
    setPendingObjectUrl(URL.createObjectURL(file));
  };

  const handleCropConfirm = async (area: Area) => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      const dataUrl = await cropAndCompressImage(pendingFile, area);
      const { photos: rows } = await api.post<{ photos: CharacterPhoto[] }>(
        `/characters/${characterId}/photos`,
        { dataUrl },
      );
      setPhotos(rows);
      cancelCrop();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível adicionar a foto.');
    } finally {
      setUploading(false);
    }
  };

  const removeCurrent = async () => {
    if (viewingIndex === null || !photos) return;
    const photo = photos[viewingIndex];
    setConfirmDelete(false);
    try {
      const result = await api.delete<{ photos: CharacterPhoto[]; photoUrl?: string | null }>(
        `/characters/${characterId}/photos/${photo.id}`,
      );
      setPhotos(result.photos);
      setViewingIndex(null);
      if ('photoUrl' in result) update((c) => setPhotoUrl(c, result.photoUrl ?? null));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível remover a foto.');
    }
  };

  const setAsProfile = async (photo: CharacterPhoto) => {
    setSettingProfile(true);
    try {
      const result = await api.post<{ photos: CharacterPhoto[]; photoUrl: string }>(
        `/characters/${characterId}/photos/${photo.id}/profile`,
      );
      setPhotos(result.photos);
      update((c) => setPhotoUrl(c, result.photoUrl));
      toast.success('Foto de perfil atualizada.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível marcar como perfil.');
    } finally {
      setSettingProfile(false);
    }
  };

  const viewing = viewingIndex !== null ? (photos?.[viewingIndex] ?? null) : null;
  const atLimit = (photos?.length ?? 0) >= MAX_CHARACTER_PHOTOS;

  return (
    <SectionCard>
      {viewing ? (
        <div className="flex flex-col gap-3">
          <div className="relative flex items-center justify-center overflow-hidden rounded-xl bg-neutral-950">
            <img src={viewing.dataUrl} alt="" className="max-h-[60vh] w-full object-contain" />
            {viewing.isProfile && (
              <Badge tone="amber" size="sm" className="absolute top-2 left-2">
                <Star className="mr-1 inline h-3 w-3" fill="currentColor" strokeWidth={0} />
                Foto de perfil
              </Badge>
            )}
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
              <div className="flex items-center gap-2">
                {!viewing.isProfile && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={settingProfile}
                    onClick={() => setAsProfile(viewing)}
                  >
                    <Star className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Marcar como perfil
                  </Button>
                )}
                <IconButton
                  label="Remover foto"
                  variant="danger"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </IconButton>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
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
                    className="relative aspect-square overflow-hidden rounded-lg bg-neutral-950 transition hover:opacity-80"
                  >
                    <img src={photo.dataUrl} alt="" className="h-full w-full object-cover" />
                    {photo.isProfile && (
                      <Star
                        className="absolute top-1 right-1 h-4 w-4 text-amber-400 drop-shadow"
                        fill="currentColor"
                        strokeWidth={0}
                      />
                    )}
                  </button>
                ))}
                {canEdit && !atLimit && (
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
          {canEdit && photos !== null && (
            <p className="text-center text-[11px] text-neutral-600">
              {atLimit
                ? 'Limite de 3 fotos atingido — remova uma para adicionar outra.'
                : `${photos.length} de ${MAX_CHARACTER_PHOTOS} fotos. Marque uma com a estrela para usá-la como foto de perfil.`}
            </p>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <ImageCropDialog
        open={pendingFile !== null}
        onOpenChange={(next) => {
          if (!next) cancelCrop();
        }}
        imageSrc={pendingObjectUrl}
        onConfirm={handleCropConfirm}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Remover esta foto?"
        message="Essa ação não pode ser desfeita."
        confirmLabel="Remover"
        onConfirm={removeCurrent}
      />
    </SectionCard>
  );
}
