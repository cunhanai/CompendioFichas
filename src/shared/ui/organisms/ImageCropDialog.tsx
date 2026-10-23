import { useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Popup } from './Popup';
import { Button } from '@/shared/ui/atoms/Button';
import { cn } from '@/shared/lib/cn';

export type CropAspectMode = 'square' | 'original';

export interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** An object/data URL for the file being cropped — null while nothing is queued. */
  imageSrc: string | null;
  onConfirm: (areaPixels: Area) => void;
  /** Which aspect presets to offer. Defaults to both. A single entry (e.g. the account avatar,
   * always shown circular) skips the toggle row entirely and locks to that one. */
  aspectModes?: CropAspectMode[];
}

/**
 * Pan/zoom crop step shown before a photo is uploaded (profile or gallery) — react-easy-crop
 * only supports a fixed-aspect crop window (pan+zoom inside it), not a freely resizable
 * rectangle, so "crop" here means choosing one of two aspect presets and framing the shot within
 * it: "Quadrada" (how every avatar is displayed app-wide) or "Original" (the source image's own
 * proportions, for a gallery photo that shouldn't be forced square). `onConfirm` hands back the
 * crop region in source-image pixel coordinates; the caller (PhotoGalleryDialog) runs it through
 * `cropAndCompressImage`.
 *
 * Deliberately not re-exported from organisms/index.ts: that barrel is imported bare (no
 * subpath) from App.tsx/AppDataProvider.tsx, which load eagerly, so anything in it ships in the
 * main bundle for every page view — react-easy-crop is only needed once someone opens the photo
 * gallery, which already lives behind the lazy-loaded sheet page. Import this file directly.
 */
export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onConfirm,
  aspectModes = ['square', 'original'],
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [mode, setMode] = useState<CropAspectMode>(aspectModes[0]);
  const [naturalAspect, setNaturalAspect] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);

  const aspect = mode === 'square' ? 1 : naturalAspect;

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setMode(aspectModes[0]);
      setAreaPixels(null);
    }
  };

  return (
    <Popup open={open} onOpenChange={handleOpenChange} title="Ajustar foto" size="md">
      <div className="flex flex-col gap-4">
        <div className="relative h-72 w-full overflow-hidden rounded-xl bg-neutral-950 sm:h-96">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_area, pixels) => setAreaPixels(pixels)}
              onMediaLoaded={(size) => setNaturalAspect(size.naturalWidth / size.naturalHeight)}
            />
          )}
        </div>

        {aspectModes.length > 1 && (
          <div className="flex items-center justify-center gap-2">
            {aspectModes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition',
                  mode === m
                    ? 'text-ink bg-amber-500'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200',
                )}
              >
                {m === 'square' ? 'Quadrada' : 'Proporção original'}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-800 accent-amber-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => areaPixels && onConfirm(areaPixels)} disabled={!areaPixels}>
            Confirmar
          </Button>
        </div>
      </div>
    </Popup>
  );
}
