import { Camera } from 'lucide-react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { Button } from '@/shared/ui/atoms/Button';

export interface PhotoUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Photo upload placeholder — no real storage backend, mirrors the mock's non-functional uploader. */
export function PhotoUploadDialog({ open, onOpenChange }: PhotoUploadDialogProps) {
  return (
    <Popup open={open} onOpenChange={onOpenChange} title="Trocar foto do personagem" size="sm">
      <div className="flex flex-col gap-4">
        <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-700 text-neutral-500">
          <Camera className="h-7 w-7" strokeWidth={1.6} />
          <span className="text-xs">Arraste uma imagem ou clique para enviar</span>
        </div>
        <Button onClick={() => onOpenChange(false)}>Salvar foto</Button>
      </div>
    </Popup>
  );
}
