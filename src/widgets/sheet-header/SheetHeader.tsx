import { useState } from 'react';
import { ArchiveRestore, Camera, ChevronLeft, Share2, Star, User } from 'lucide-react';
import { useCharacter } from '@/app/providers';
import {
  alignmentAbbrev,
  classesSummary,
  effectiveLevel,
} from '@/entities/character/model/calculations';
import {
  PhotoUploadDialog,
  ShareDialog,
  toggleActive,
  toggleFavorite,
  useShareDialog,
} from '@/features/sheet-sharing';
import { Switch } from '@/shared/ui/atoms/Switch';
import { IconButton } from '@/shared/ui/atoms/IconButton';
import { Badge } from '@/shared/ui/atoms/Badge';

export function SheetHeader({ characterId, onBack }: { characterId: string; onBack: () => void }) {
  const { character, update } = useCharacter(characterId);
  const {
    open: shareOpen,
    openDialog: openShare,
    onOpenChange: onShareOpenChange,
    onActivate,
    onStop,
  } = useShareDialog(characterId);
  const [photoOpen, setPhotoOpen] = useState(false);

  const actions = (
    <>
      <Switch
        checked={character.active}
        onCheckedChange={() => update(toggleActive)}
        label="Marcar como ativa/inativa"
        tone="emerald"
      />
      <IconButton
        label="Favoritar"
        variant={character.favorited ? 'amber' : 'neutral'}
        size="sm"
        onClick={() => update(toggleFavorite)}
      >
        <Star
          className="h-3.5 w-3.5"
          fill={character.favorited ? 'currentColor' : 'none'}
          strokeWidth={1.8}
        />
      </IconButton>
      <IconButton label="Compartilhar / exportar" variant="neutral" size="sm" onClick={openShare}>
        <Share2 className="h-3.5 w-3.5" strokeWidth={1.8} />
      </IconButton>
    </>
  );

  return (
    <div className="mb-5 flex flex-col gap-3">
      <div className="flex items-center justify-end gap-2 sm:hidden">{actions}</div>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-amber-600/50 hover:text-amber-400"
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
        <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-amber-600/50 bg-neutral-800 text-neutral-600 sm:h-16 sm:w-16">
            <User className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} />
          </div>
          <button
            type="button"
            title="Trocar foto"
            onClick={() => setPhotoOpen(true)}
            className="text-ink absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-neutral-950 bg-amber-500 hover:bg-amber-400"
          >
            <Camera className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-lg leading-tight text-neutral-100 sm:text-2xl">
              {character.name}
            </h1>
            <Badge tone={character.active ? 'emerald' : 'neutral'} size="sm">
              {character.active ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500 sm:text-sm">
            {character.identity.raca} · {classesSummary(character.classes)} · Nível efetivo{' '}
            {effectiveLevel(character.classes)} ·{' '}
            {alignmentAbbrev(character.alignmentLaw, character.alignmentMoral)}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">{actions}</div>
      </div>

      {!character.active && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 px-4 py-2.5 text-xs text-neutral-500">
          <ArchiveRestore className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          Personagem inativa — a ficha está arquivada e não pode ser editada. Reative para editar.
        </div>
      )}

      <PhotoUploadDialog open={photoOpen} onOpenChange={setPhotoOpen} />
      <ShareDialog
        open={shareOpen}
        onOpenChange={onShareOpenChange}
        shared={character.shared}
        shareSlug={character.shareSlug}
        onActivate={onActivate}
        onStop={onStop}
      />
    </div>
  );
}
