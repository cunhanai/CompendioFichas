import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { Button } from '@/shared/ui/atoms/Button';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { resizeImageToDataUrl } from '@/shared/lib/image';
import { useAppToast } from '@/shared/ui/organisms';

export interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoUrl: string | null;
  onSave: (dataUrl: string) => void;
}

// Generous enough for any real photo, small enough that a "file" claiming to be an image can't
// be used to hang the tab decoding it before the real validation (the browser's own image
// decoder, via resizeImageToDataUrl) even runs.
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

/**
 * Photo upload for a character portrait. Security note: this never trusts the file's declared
 * MIME type or extension — `resizeImageToDataUrl` hands the file to the browser's own image
 * decoder (via an <img> element) and only proceeds if it genuinely decodes as an image, then
 * re-encodes it from scratch onto a canvas. That re-encode is what actually matters: the output
 * data URL can only ever contain pixel data the browser itself decoded, so a polyglot file, a
 * renamed non-image, or a corrupted/crafted image can't smuggle anything through — a decode
 * failure is the only way to fail this check, and it always does for anything that isn't a real,
 * intact image the browser can render.
 */
export function PhotoUploadDialog({
  open,
  onOpenChange,
  photoUrl,
  onSave,
}: PhotoUploadDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useAppToast();
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

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

    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setPreview(dataUrl);
    } catch {
      toast.error('Esse arquivo não é uma imagem válida.');
    }
  };

  const close = (nextOpen: boolean) => {
    if (!nextOpen) setPreview(null);
    onOpenChange(nextOpen);
  };

  const handleSave = () => {
    if (!preview) return;
    onSave(preview);
    close(false);
  };

  return (
    <Popup open={open} onOpenChange={close} title="Trocar foto do personagem" size="sm">
      <div className="flex flex-col gap-4">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-neutral-500 transition ${
            dragOver ? 'border-amber-500 bg-amber-950/10 text-amber-400' : 'border-neutral-700'
          }`}
        >
          {(preview ?? photoUrl) ? (
            <Avatar src={preview ?? photoUrl} size="lg" tone="amber" />
          ) : (
            <>
              <Camera className="h-7 w-7" strokeWidth={1.6} />
              <span className="text-xs">Arraste uma imagem ou clique para enviar</span>
            </>
          )}
          <span className="text-[11px] text-neutral-600">
            {preview
              ? 'Clique para escolher outra'
              : photoUrl
                ? 'Foto atual — clique para trocar'
                : 'PNG, JPG, WEBP ou GIF — até 8 MB'}
          </span>
        </div>
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
        <Button onClick={handleSave} disabled={!preview}>
          <Upload className="h-4 w-4" strokeWidth={1.8} />
          Salvar foto
        </Button>
      </div>
    </Popup>
  );
}
