import { useState } from 'react';
import { Library, Plus, Skull, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import { classesSummary, effectiveLevel } from '@/entities/character/model/calculations';
import { createBlankCharacter } from '@/entities/character/model/factory';
import { CharCard } from '@/entities/character/ui/CharCard';
import { Breadcrumbs } from '@/widgets/app-shell';
import { Button } from '@/shared/ui/atoms/Button';
import { IconButton } from '@/shared/ui/atoms/IconButton';
import { ShareDialog, useShareDialog } from '@/features/sheet-sharing';

export function CharactersPage() {
  const { systemId = '' } = useParams<{ systemId: string }>();
  const { systems, characters, libraries, addCharacter } = useAppData();
  const navigate = useNavigate();
  const [shareOpenId, setShareOpenId] = useState<string | null>(null);

  const system = systems.find((s) => s.id === systemId);
  const library = libraries[systemId];
  const roster = characters.filter((c) => c.systemId === systemId);
  const favorite = roster.find((c) => c.favorited);
  const active = roster.filter((c) => !c.favorited && c.active);
  const inactive = roster.filter((c) => !c.favorited && !c.active);

  const handleNewCharacter = () => {
    const character = createBlankCharacter(systemId, 'Novo personagem');
    addCharacter(character);
    navigate(routes.sheet(character.id));
  };

  const cardProps = (c: (typeof roster)[number], showStatusBadge = false) => ({
    name: c.name,
    subtitle: `${c.identity.raca} · ${classesSummary(c.classes)} — Nível ${effectiveLevel(c.classes)}`,
    hpCurrent: c.hpCurrent,
    hpMax: c.hpMax,
    active: c.active,
    showStatusBadge,
    shared: c.shared,
    onOpen: () => navigate(routes.sheet(c.id)),
    onShare: () => setShareOpenId(c.id),
  });

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 md:px-10 md:py-10">
      <Breadcrumbs
        items={[
          { label: 'Início', onClick: () => navigate(routes.dashboard()) },
          { label: 'Sistemas', onClick: () => navigate(routes.systems()) },
          { label: system?.title ?? '' },
        ]}
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-neutral-100">{system?.title}</h1>
          <p className="mt-1 text-xs text-neutral-500">
            {roster.length} personagens
            {library &&
              ` · biblioteca compartilhada com ${system?.playerCount ?? 0} outros jogadores`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            label="Biblioteca compartilhada"
            variant="neutral"
            size="lg"
            onClick={() => navigate(routes.library(systemId))}
          >
            <Library className="h-5 w-5" strokeWidth={1.8} />
          </IconButton>
          <IconButton label="Fichas de monstros (mestre)" variant="neutral" size="lg" disabled>
            <Skull className="h-5 w-5" strokeWidth={1.8} />
          </IconButton>
          <Button size="lg" onClick={handleNewCharacter}>
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Novo personagem
          </Button>
        </div>
      </div>

      {favorite && (
        <>
          <h2 className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-amber-500/80 uppercase">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            Favorito
          </h2>
          <div className="mb-6">
            <CharCard {...cardProps(favorite)} favorited />
          </div>
        </>
      )}

      <h2 className="mb-2.5 text-xs font-semibold tracking-wider text-emerald-500/80 uppercase">
        Ativos
      </h2>
      <div className="mb-6 flex flex-col gap-2.5">
        {active.map((c) => (
          <CharCard key={c.id} {...cardProps(c, true)} />
        ))}
      </div>

      {inactive.length > 0 && (
        <>
          <h2 className="mb-2.5 text-xs font-semibold tracking-wider text-neutral-600 uppercase">
            Inativos
          </h2>
          <div className="flex flex-col gap-2.5 opacity-70">
            {inactive.map((c) => (
              <CharCard key={c.id} {...cardProps(c, true)} />
            ))}
          </div>
        </>
      )}

      {shareOpenId && (
        <CharacterShareDialog characterId={shareOpenId} onClose={() => setShareOpenId(null)} />
      )}
    </main>
  );
}

function CharacterShareDialog({
  characterId,
  onClose,
}: {
  characterId: string;
  onClose: () => void;
}) {
  const { character, onActivate, onStop } = useShareDialog(characterId);
  return (
    <ShareDialog
      open
      onOpenChange={(open) => !open && onClose()}
      shared={character.shared}
      shareSlug={character.shareSlug}
      onActivate={onActivate}
      onStop={onStop}
    />
  );
}
