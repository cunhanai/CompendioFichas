import { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';
import type { Area } from 'react-easy-crop';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { ImageCropDialog } from '@/shared/ui/organisms/ImageCropDialog';
import { cropAndCompressImage } from '@/shared/lib/image';
import { useAppToast } from '@/shared/ui/organisms';

export interface AvatarUploadProps {
  src: string | null;
  onChange: (dataUrl: string) => void;
}

/** Large avatar with a camera button overlay to pick, crop and upload a new profile picture —
 * goes through the same ImageCropDialog as the character photo gallery (pan/zoom, then
 * cropAndCompressImage), locked to a square aspect since this avatar is always shown circular. */
export function AvatarUpload({ src, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useAppToast();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingObjectUrl, setPendingObjectUrl] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setPendingFile(file);
    setPendingObjectUrl(URL.createObjectURL(file));
  };

  // Revokes the pending crop's blob URL whenever it's replaced by a new one, and on unmount —
  // cancelCrop/handleCropConfirm already revoke it on their own explicit paths, but neither runs
  // if this component unmounts while a crop is still pending, which would otherwise leak the
  // blob for the rest of the page's lifetime.
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

  const handleCropConfirm = async (area: Area) => {
    if (!pendingFile) return;
    try {
      const dataUrl = await cropAndCompressImage(pendingFile, area, {
        maxDim: 400,
        maxDataUrlLength: 150_000,
      });
      onChange(dataUrl);
      cancelCrop();
    } catch {
      toast.error('Não foi possível processar essa imagem.');
    }
  };

  return (
    <>
      <div className="relative shrink-0">
        <Avatar tone="amber" size="lg" src={src} />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Alterar foto de perfil"
          className="bg-ink absolute right-0 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-neutral-950 text-amber-400 shadow-md transition hover:text-amber-300"
        >
          <Camera className="h-3.5 w-3.5" strokeWidth={1.8} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      <ImageCropDialog
        open={pendingFile !== null}
        onOpenChange={(next) => {
          if (!next) cancelCrop();
        }}
        imageSrc={pendingObjectUrl}
        onConfirm={handleCropConfirm}
        aspectModes={['square']}
      />
    </>
  );
}
