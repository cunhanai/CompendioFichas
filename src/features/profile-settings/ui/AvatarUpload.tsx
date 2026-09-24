import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { resizeImageToDataUrl } from '@/shared/lib/image';
import { useAppToast } from '@/shared/ui/organisms';

export interface AvatarUploadProps {
  src: string | null;
  onChange: (dataUrl: string) => void;
}

/** Large avatar with a camera button overlay to pick, resize and upload a new profile picture. */
export function AvatarUpload({ src, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useAppToast();

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      onChange(dataUrl);
    } catch {
      toast.error('Não foi possível processar essa imagem.');
    }
  };

  return (
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
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
