import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useCharacter, useLibrary } from '@/app/providers';
import type { SpellLibraryItem } from '@/entities/library-item/model/types';
import {
  SpellBookCard,
  SpellBookCreateDialog,
  SpellLikeDetailDialog,
  SpellPickDialog,
  addSpellLikeAbility,
  addSpellToBook,
  createSpellbook,
  removeSpellbook,
  setCircleMax,
} from '@/features/spellbook';
import {
  SectionCard,
  SectionCardButton,
  SectionCardHeader,
} from '@/shared/ui/molecules/SectionCard';
import { InfoDialog } from '@/shared/ui/organisms/InfoDialog';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Button } from '@/shared/ui/atoms/Button';
import { EmptyState } from '@/shared/ui/molecules/EmptyState';

export function MagiasTab({ characterId, systemId }: { characterId: string; systemId: string }) {
  const { character, update } = useCharacter(characterId);
  const library = useLibrary(systemId);
  const [pickBookIndex, setPickBookIndex] = useState<number | null>(null);
  const [detailSpell, setDetailSpell] = useState<SpellLibraryItem | null>(null);
  const [detailSlaId, setDetailSlaId] = useState<string | null>(null);
  const [justCreatedSlaId, setJustCreatedSlaId] = useState<string | null>(null);
  const [creatingBook, setCreatingBook] = useState(false);

  const openSpellDetailByName = (name: string) => {
    const found = library?.magias.find((s) => s.name === name);
    if (found) setDetailSpell(found);
  };

  const nothingYet =
    character.spellbooks.length === 0 &&
    character.spellLikeAbilities.length === 0 &&
    !character.favoredSchool &&
    character.opposedSchools.length === 0;

  return (
    <div className="flex flex-col gap-5">
      {character.active && (
        <div className="flex justify-end">
          <Button onClick={() => setCreatingBook(true)}>
            <Plus className="h-4 w-4" strokeWidth={2.2} />
            Adicionar grimório
          </Button>
        </div>
      )}

      {nothingYet && (
        <EmptyState
          icon={<Plus className="h-6 w-6" strokeWidth={1.6} />}
          title="Nenhuma magia registrada ainda"
          description="Se o personagem conjura magias, adicione um grimório para começar a registrar truques e magias por círculo."
        />
      )}

      {(character.favoredSchool || character.opposedSchools.length > 0) && (
        <SectionCard>
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Escolas de magia
          </h3>
          <div className="flex flex-wrap gap-2">
            {character.favoredSchool && (
              <Badge tone="amber" size="md">
                Focada: {character.favoredSchool}
              </Badge>
            )}
            {character.opposedSchools.map((school) => (
              <Badge key={school} tone="rose" size="md">
                Oposta: {school}
              </Badge>
            ))}
          </div>
        </SectionCard>
      )}

      {character.spellbooks.map((book, i) => (
        <SpellBookCard
          key={book.className}
          book={book}
          editable={character.active}
          onSearch={() => setPickBookIndex(i)}
          onOpenSpell={openSpellDetailByName}
          onSetCircleMax={(circleIndex, max) => update((c) => setCircleMax(c, i, circleIndex, max))}
          onRemove={() => update((c) => removeSpellbook(c, i))}
        />
      ))}

      {(character.spellLikeAbilities.length > 0 || character.active) && (
        <SectionCard>
          <SectionCardHeader
            title="Habilidades similares a magia"
            action={
              character.active && (
                <button
                  type="button"
                  onClick={() => {
                    let newId = '';
                    update((c) => {
                      const next = addSpellLikeAbility(c);
                      newId = next.spellLikeAbilities[next.spellLikeAbilities.length - 1].id;
                      return next;
                    });
                    setJustCreatedSlaId(newId);
                    setDetailSlaId(newId);
                  }}
                  className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Nova habilidade
                </button>
              )
            }
          />
          <div className="flex flex-col gap-2.5">
            {character.spellLikeAbilities.map((sla) => (
              <SectionCardButton
                key={sla.id}
                className="p-0"
                onClick={() => setDetailSlaId(sla.id)}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm text-neutral-200">{sla.name}</p>
                    {sla.spells && <p className="text-[11px] text-neutral-500">{sla.spells}</p>}
                  </div>
                  {sla.usesPerDay && (
                    <span className="shrink-0 text-xs text-neutral-400">{sla.usesPerDay}</span>
                  )}
                </div>
              </SectionCardButton>
            ))}
          </div>
        </SectionCard>
      )}

      {pickBookIndex != null && (
        <SpellPickDialog
          open
          onOpenChange={(o) => !o && setPickBookIndex(null)}
          spells={library?.magias ?? []}
          onPick={(spell) => {
            update((c) => addSpellToBook(c, pickBookIndex, spell));
            setPickBookIndex(null);
          }}
          onViewDetail={(spell) => setDetailSpell(spell)}
        />
      )}

      <InfoDialog
        open={detailSpell != null}
        onOpenChange={(o) => !o && setDetailSpell(null)}
        title={detailSpell?.name ?? ''}
        subtitle={
          detailSpell
            ? `${detailSpell.school} · ${detailSpell.circle === 0 ? 'truque' : `${detailSpell.circle}º círculo`}`
            : ''
        }
        description={detailSpell?.desc}
        rows={
          detailSpell
            ? [
                { label: 'Execução', value: detailSpell.castTime },
                { label: 'Alcance', value: detailSpell.range },
                { label: 'Duração', value: detailSpell.duration },
                { label: 'Resistência', value: detailSpell.resistance },
              ]
            : []
        }
      />

      {detailSlaId && (
        <SpellLikeDetailDialog
          open
          onOpenChange={(o) => {
            if (!o) {
              setDetailSlaId(null);
              setJustCreatedSlaId(null);
            }
          }}
          abilityId={detailSlaId}
          character={character}
          update={update}
          startEditing={detailSlaId === justCreatedSlaId}
        />
      )}

      <SpellBookCreateDialog
        open={creatingBook}
        onOpenChange={setCreatingBook}
        onCreate={(input) => {
          update((c) => createSpellbook(c, input));
          setCreatingBook(false);
        }}
      />
    </div>
  );
}
