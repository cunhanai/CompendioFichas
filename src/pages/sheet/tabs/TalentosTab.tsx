import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppData, useCharacter, useLibrary } from '@/app/providers';
import {
  FeatDetailDialog,
  FeatLibraryAddDialog,
  FeatPickDialog,
  SpecialDetailDialog,
  SpecialPickDialog,
  addCustomSpecial,
  addFeatFromLibrary,
  addSpecialFromLibrary,
} from '@/features/feats-and-abilities';
import { SectionCard, SectionCardHeader } from '@/shared/ui/molecules/SectionCard';

export function TalentosTab({ characterId, systemId }: { characterId: string; systemId: string }) {
  const { character, update } = useCharacter(characterId);
  const { addFeatToLibrary } = useAppData();
  const library = useLibrary(systemId);
  const [featPickOpen, setFeatPickOpen] = useState(false);
  const [specialPickOpen, setSpecialPickOpen] = useState(false);
  const [newFeatOpen, setNewFeatOpen] = useState(false);
  const [featDetailId, setFeatDetailId] = useState<string | null>(null);
  const [specialDetailId, setSpecialDetailId] = useState<string | null>(null);
  const [justCreatedSpecialId, setJustCreatedSpecialId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <SectionCard>
        <SectionCardHeader
          title="Talentos"
          action={
            <button
              type="button"
              onClick={() => setFeatPickOpen(true)}
              className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Buscar talento
            </button>
          }
        />
        <div className="flex flex-col gap-2.5">
          {character.feats.map((feat) => (
            <button
              key={feat.id}
              type="button"
              onClick={() => setFeatDetailId(feat.id)}
              className="rounded-lg bg-neutral-950 px-4 py-3 text-left transition hover:bg-neutral-900"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-neutral-200">{feat.name}</p>
                <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400 uppercase">
                  {feat.tag}
                </span>
              </div>
              {feat.resumo && <p className="mt-1 text-xs text-neutral-500">{feat.resumo}</p>}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionCardHeader
          title="Habilidades especiais"
          action={
            <button
              type="button"
              onClick={() => setSpecialPickOpen(true)}
              className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Nova habilidade
            </button>
          }
        />
        <div className="flex flex-col gap-2.5">
          {character.specials.map((sp) => (
            <button
              key={sp.id}
              type="button"
              onClick={() => setSpecialDetailId(sp.id)}
              className="flex items-start justify-between gap-2 rounded-lg bg-neutral-950 px-4 py-3 text-left transition hover:bg-neutral-900"
            >
              <div className="min-w-0">
                <p className="text-sm text-neutral-200">{sp.name}</p>
                <p className="text-[11px] text-neutral-500">{sp.subtitle}</p>
                {sp.resumo && <p className="mt-1 text-xs text-neutral-500">{sp.resumo}</p>}
              </div>
              {sp.uses && <span className="shrink-0 text-xs text-neutral-400">{sp.uses}</span>}
            </button>
          ))}
        </div>
      </SectionCard>

      <FeatPickDialog
        open={featPickOpen}
        onOpenChange={setFeatPickOpen}
        feats={library?.talentos ?? []}
        addedNames={character.feats.map((f) => f.name)}
        onPick={(feat) => update((c) => addFeatFromLibrary(c, feat))}
        onCreateNew={() => {
          setFeatPickOpen(false);
          setNewFeatOpen(true);
        }}
      />
      <FeatLibraryAddDialog
        open={newFeatOpen}
        onOpenChange={setNewFeatOpen}
        onSubmit={(feat) => {
          const id = crypto.randomUUID();
          addFeatToLibrary(systemId, { ...feat, id });
          update((c) => addFeatFromLibrary(c, { ...feat, id }));
          setNewFeatOpen(false);
        }}
      />
      <SpecialPickDialog
        open={specialPickOpen}
        onOpenChange={setSpecialPickOpen}
        specials={library?.habilidades ?? []}
        addedNames={character.specials.map((s) => s.name)}
        onPick={(sp) => {
          update((c) => addSpecialFromLibrary(c, sp));
          setSpecialPickOpen(false);
        }}
        onCreateCustom={() => {
          let newId = '';
          update((c) => {
            const next = addCustomSpecial(c);
            newId = next.specials[next.specials.length - 1].id;
            return next;
          });
          setSpecialPickOpen(false);
          setJustCreatedSpecialId(newId);
          setSpecialDetailId(newId);
        }}
      />

      {featDetailId && (
        <FeatDetailDialog
          open
          onOpenChange={(o) => !o && setFeatDetailId(null)}
          featId={featDetailId}
          character={character}
          update={update}
        />
      )}
      {specialDetailId && (
        <SpecialDetailDialog
          open
          onOpenChange={(o) => {
            if (!o) {
              setSpecialDetailId(null);
              setJustCreatedSpecialId(null);
            }
          }}
          specialId={specialDetailId}
          character={character}
          update={update}
          startEditing={specialDetailId === justCreatedSpecialId}
        />
      )}
    </div>
  );
}
