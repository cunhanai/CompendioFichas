import { useState } from 'react';
import { useCharacter, useLibrary } from '@/app/providers';
import type { SpellLibraryItem } from '@/entities/library-item/model/types';
import { SpellBookCard, SpellPickDialog, addSpellToBook } from '@/features/spellbook';
import { SectionCard, SectionCardButton } from '@/shared/ui/molecules/SectionCard';
import { InfoDialog } from '@/shared/ui/organisms/InfoDialog';
import { Badge } from '@/shared/ui/atoms/Badge';

export function MagiasTab({ characterId, systemId }: { characterId: string; systemId: string }) {
  const { character, update } = useCharacter(characterId);
  const library = useLibrary(systemId);
  const [pickBookIndex, setPickBookIndex] = useState<number | null>(null);
  const [detailSpell, setDetailSpell] = useState<SpellLibraryItem | null>(null);
  const [detailSlaId, setDetailSlaId] = useState<string | null>(null);

  const openSpellDetailByName = (name: string) => {
    const found = library?.magias.find((s) => s.name === name);
    if (found) setDetailSpell(found);
  };

  const sla = character.spellLikeAbilities.find((s) => s.id === detailSlaId);

  return (
    <div className="flex flex-col gap-5">
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
          onSearch={() => setPickBookIndex(i)}
          onOpenSpell={openSpellDetailByName}
        />
      ))}

      {character.spellLikeAbilities.length > 0 && (
        <SectionCard>
          <h3 className="mb-3 text-sm font-semibold text-neutral-100">
            Habilidades similares a magia
          </h3>
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
                    <p className="text-[11px] text-neutral-500">{sla.subtitle}</p>
                  </div>
                  {sla.uses && (
                    <span className="shrink-0 text-xs text-neutral-400">{sla.uses}</span>
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

      <InfoDialog
        open={sla != null}
        onOpenChange={(o) => !o && setDetailSlaId(null)}
        title={sla?.name ?? ''}
        subtitle={sla?.subtitle}
        description={sla?.desc}
      />
    </div>
  );
}
