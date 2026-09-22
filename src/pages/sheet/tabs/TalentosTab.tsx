import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppData, useCharacter, useLibrary } from '@/app/providers';
import type { Character } from '@/entities/character/model/types';
import {
  FeatPickDialog,
  SpecialPickDialog,
  addCustomSpecial,
  addFeatFromLibrary,
  addSpecialFromLibrary,
} from '@/features/feats-and-abilities';
import { AddLibraryItemDialog } from '@/features/shared-library';
import { SectionCard, SectionCardHeader } from '@/shared/ui/molecules/SectionCard';
import { InfoDialog } from '@/shared/ui/organisms/InfoDialog';

type Detail = {
  kind: 'feat' | 'special';
  item: Character['feats'][number] | Character['specials'][number];
} | null;

export function TalentosTab({ characterId, systemId }: { characterId: string; systemId: string }) {
  const { character, update } = useCharacter(characterId);
  const { addLibraryItem } = useAppData();
  const library = useLibrary(systemId);
  const [featPickOpen, setFeatPickOpen] = useState(false);
  const [specialPickOpen, setSpecialPickOpen] = useState(false);
  const [newFeatOpen, setNewFeatOpen] = useState(false);
  const [detail, setDetail] = useState<Detail>(null);

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
              onClick={() => setDetail({ kind: 'feat', item: feat })}
              className="rounded-lg bg-neutral-950 px-4 py-3 text-left transition hover:bg-neutral-900"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-neutral-200">{feat.name}</p>
                <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400 uppercase">
                  {feat.tag}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">{feat.desc}</p>
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
              onClick={() => setDetail({ kind: 'special', item: sp })}
              className="flex items-center justify-between rounded-lg bg-neutral-950 px-4 py-3 text-left transition hover:bg-neutral-900"
            >
              <div>
                <p className="text-sm text-neutral-200">{sp.name}</p>
                <p className="text-[11px] text-neutral-500">{sp.subtitle}</p>
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
      <AddLibraryItemDialog
        open={newFeatOpen}
        onOpenChange={setNewFeatOpen}
        onSubmit={(values) => {
          addLibraryItem(systemId, 'talentos', values);
          update((c) =>
            addFeatFromLibrary(c, { ...values, id: crypto.randomUUID(), tag: 'Talento' }),
          );
          setNewFeatOpen(false);
        }}
      />
      <SpecialPickDialog
        open={specialPickOpen}
        onOpenChange={setSpecialPickOpen}
        specials={library?.habilidades ?? []}
        onPick={(sp) => {
          update((c) => addSpecialFromLibrary(c, sp));
          setSpecialPickOpen(false);
        }}
        onCreateCustom={() => {
          update(addCustomSpecial);
          setSpecialPickOpen(false);
        }}
      />

      <InfoDialog
        open={detail != null}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.item.name ?? ''}
        subtitle={
          detail?.kind === 'feat'
            ? (detail.item as Character['feats'][number]).tag
            : (detail?.item as Character['specials'][number] | undefined)?.subtitle
        }
        description={detail?.item.desc}
      />
    </div>
  );
}
