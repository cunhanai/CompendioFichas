import { useEffect, useRef, useState } from 'react';
import { ArchiveRestore, Camera, Check, ChevronLeft, Eye, Share2, Star, X } from 'lucide-react';
import { useAppData, useCharacter } from '@/app/providers';
import {
  alignmentAbbrev,
  classesSummary,
  effectiveLevel,
} from '@/entities/character/model/calculations';
import { joinDot } from '@/shared/lib/format';
import {
  PhotoUploadDialog,
  SharePickerDialog,
  setPhotoUrl,
  toggleActive,
  toggleFavorite,
} from '@/features/sheet-sharing';
import { setName } from '@/features/sheet-identity';
import { Switch } from '@/shared/ui/atoms/Switch';
import { IconButton } from '@/shared/ui/atoms/IconButton';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Avatar } from '@/shared/ui/atoms/Avatar';

export function SheetHeader({ characterId, onBack }: { characterId: string; onBack: () => void }) {
  const { character, update, readOnly, ownerUsername } = useCharacter(characterId);
  const { mySharesByCharacterId, shareCharacter, unshareCharacter } = useAppData();
  const [shareOpen, setShareOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(character.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  const canEdit = character.active && !readOnly;

  const startEditingName = () => {
    if (!canEdit) return;
    setNameDraft(character.name);
    setEditingName(true);
  };
  const saveName = () => {
    const trimmed = nameDraft.trim();
    if (trimmed) update((c) => setName(c, trimmed));
    setEditingName(false);
  };

  const currentShares = mySharesByCharacterId[characterId] ?? [];

  const actions = readOnly ? (
    <Badge tone="sky" size="sm">
      <Eye className="mr-1 inline h-3 w-3" strokeWidth={2} />
      Somente leitura
    </Badge>
  ) : (
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
      <IconButton
        label="Compartilhar"
        variant="neutral"
        size="sm"
        onClick={() => setShareOpen(true)}
      >
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
          <Avatar src={character.photoUrl} tone="amber" />
          {canEdit && (
            <button
              type="button"
              title="Trocar foto"
              onClick={() => setPhotoOpen(true)}
              className="text-ink absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-neutral-950 bg-amber-500 hover:bg-amber-400"
            >
              <Camera className="h-3 w-3" strokeWidth={2} />
            </button>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={nameInputRef}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveName();
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  className="font-display min-w-0 rounded-md border border-amber-600/50 bg-neutral-950 px-2 py-0.5 text-lg text-neutral-100 outline-none sm:text-2xl"
                />
                <IconButton label="Salvar nome" variant="amber" size="sm" onClick={saveName}>
                  <Check className="h-3.5 w-3.5" strokeWidth={2} />
                </IconButton>
                <IconButton
                  label="Cancelar"
                  variant="neutral"
                  size="sm"
                  onClick={() => setEditingName(false)}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </IconButton>
              </div>
            ) : (
              <h1
                className="font-display cursor-text text-lg leading-tight text-neutral-100 select-none sm:text-2xl"
                onDoubleClick={startEditingName}
                title={canEdit ? 'Clique duas vezes para editar o nome' : undefined}
              >
                {character.name}
              </h1>
            )}
            <Badge tone={character.active ? 'emerald' : 'neutral'} size="sm">
              {character.active ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500 sm:text-sm">
            {joinDot([
              character.identity.raca,
              classesSummary(character.classes) || 'Sem classe',
              `Nível efetivo ${effectiveLevel(character.classes)}`,
              alignmentAbbrev(character.alignmentLaw, character.alignmentMoral),
            ])}
          </p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">{actions}</div>
      </div>

      {readOnly ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-sky-800/40 bg-sky-950/20 px-4 py-2.5 text-xs text-sky-300">
          <Eye className="h-4 w-4 shrink-0" strokeWidth={1.8} />
          Ficha de @{ownerUsername} compartilhada com você — somente leitura.
        </div>
      ) : (
        !character.active && (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/40 px-4 py-2.5 text-xs text-neutral-500">
            <ArchiveRestore className="h-4 w-4 shrink-0" strokeWidth={1.8} />
            Personagem inativa — a ficha está arquivada e não pode ser editada. Reative para editar.
          </div>
        )
      )}

      {!readOnly && (
        <>
          <PhotoUploadDialog
            open={photoOpen}
            onOpenChange={setPhotoOpen}
            photoUrl={character.photoUrl}
            onSave={(dataUrl) => update((c) => setPhotoUrl(c, dataUrl))}
          />
          <SharePickerDialog
            open={shareOpen}
            onOpenChange={setShareOpen}
            currentShares={currentShares}
            onShare={(userId) => shareCharacter(characterId, userId)}
            onUnshare={(userId) => unshareCharacter(characterId, userId)}
          />
        </>
      )}
    </div>
  );
}
