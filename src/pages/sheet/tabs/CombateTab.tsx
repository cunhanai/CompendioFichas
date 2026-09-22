import { useState } from 'react';
import { Plus, ShieldCheck, Swords, Zap } from 'lucide-react';
import { DragDropProvider } from '@dnd-kit/react';
import type { DragEndEvent } from '@dnd-kit/react';
import { useAppData, useCharacter, useLibrary } from '@/app/providers';
import {
  computeAc,
  computeAllAbilities,
  computeInitiative,
  computeManobras,
  computeSave,
  signed,
} from '@/entities/character/model/calculations';
import type { Saves } from '@/entities/character/model/types';
import { SAVE_LABEL } from '@/entities/character/model/calculations';
import {
  AcDialog,
  InitDialog,
  ManobrasDialog,
  RmDialog,
  SavesDialog,
} from '@/features/combat-stats';
import {
  WeaponRow,
  WeaponDetailDialog,
  WeaponPickDialog,
  WeaponLibraryAddDialog,
  addWeaponFromLibrary,
  moveWeapon,
} from '@/features/weapons';
import { StatCard } from '@/shared/ui/molecules/StatCard';
import { SectionCard, SectionCardHeader } from '@/shared/ui/molecules/SectionCard';

type Popup =
  | { kind: 'init' }
  | { kind: 'rm' }
  | { kind: 'ac'; tab: 'total' | 'touch' | 'flat' }
  | { kind: 'saves'; tab: keyof Saves }
  | { kind: 'manobras'; tab: 'bba' | 'bmc' | 'dmc' }
  | { kind: 'weapon'; id: string }
  | { kind: 'weaponPick' }
  | { kind: 'weaponLibraryAdd' }
  | null;

export function CombateTab({ characterId, systemId }: { characterId: string; systemId: string }) {
  const { character, update } = useCharacter(characterId);
  const { addWeaponToLibrary } = useAppData();
  const library = useLibrary(systemId);
  const [popup, setPopup] = useState<Popup>(null);
  const close = () => setPopup(null);

  const abilities = computeAllAbilities(character.abilities);
  const ac = computeAc(character, abilities);
  const init = computeInitiative(character, abilities);
  const { bba, bmc, dmc } = computeManobras(character, abilities);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Zap className="h-5 w-5" strokeWidth={1.8} />}
          value={signed(init)}
          label="Iniciativa"
          onClick={() => setPopup({ kind: 'init' })}
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" strokeWidth={1.8} />}
          value={character.rmValue}
          label="Resistência a Magia"
          tone="sky"
          onClick={() => setPopup({ kind: 'rm' })}
        />
      </div>

      <SectionCard>
        <SectionCardHeader title="Classe de Armadura" />
        <div className="flex flex-col gap-2.5">
          <Row
            label="Completa"
            value={ac.total}
            onClick={() => setPopup({ kind: 'ac', tab: 'total' })}
          />
          <Row
            label="CA de Toque"
            value={ac.touch}
            onClick={() => setPopup({ kind: 'ac', tab: 'touch' })}
          />
          <Row
            label="CA Desprevenido"
            value={ac.flat}
            onClick={() => setPopup({ kind: 'ac', tab: 'flat' })}
          />
        </div>
      </SectionCard>

      <SectionCard>
        <SectionCardHeader title="Jogadas de resistência" />
        <div className="flex flex-col gap-2.5">
          {(Object.keys(SAVE_LABEL) as (keyof Saves)[]).map((key) => (
            <Row
              key={key}
              label={SAVE_LABEL[key]}
              value={signed(computeSave(key, character, abilities).total)}
              onClick={() => setPopup({ kind: 'saves', tab: key })}
            />
          ))}
        </div>
      </SectionCard>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Swords className="h-5 w-5" strokeWidth={1.8} />}
          value={signed(bba)}
          label="BBA"
          onClick={() => setPopup({ kind: 'manobras', tab: 'bba' })}
        />
        <StatCard
          icon={<Swords className="h-5 w-5" strokeWidth={1.8} />}
          value={signed(bmc)}
          label="BMC"
          onClick={() => setPopup({ kind: 'manobras', tab: 'bmc' })}
        />
        <StatCard
          icon={<Swords className="h-5 w-5" strokeWidth={1.8} />}
          value={dmc}
          label="DMC"
          onClick={() => setPopup({ kind: 'manobras', tab: 'dmc' })}
        />
      </div>

      <SectionCard>
        <SectionCardHeader
          title="Armas"
          action={
            <button
              type="button"
              onClick={() => setPopup({ kind: 'weaponPick' })}
              className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Nova arma
            </button>
          }
        />
        <DragDropProvider
          onDragEnd={(event: DragEndEvent) => {
            const sourceId = event.operation.source?.id;
            const targetId = event.operation.target?.id;
            if (typeof sourceId !== 'string' || typeof targetId !== 'string') return;
            const toIndex = character.weapons.findIndex((w) => w.id === targetId);
            if (toIndex === -1) return;
            update((c) => moveWeapon(c, sourceId, toIndex));
          }}
        >
          <div className="flex flex-col gap-2.5">
            {character.weapons.map((w, i) => (
              <WeaponRow
                key={w.id}
                weapon={w}
                index={i}
                onOpen={() => setPopup({ kind: 'weapon', id: w.id })}
              />
            ))}
          </div>
        </DragDropProvider>
      </SectionCard>

      <InitDialog
        open={popup?.kind === 'init'}
        onOpenChange={(o) => !o && close()}
        character={character}
        update={update}
      />
      <RmDialog
        open={popup?.kind === 'rm'}
        onOpenChange={(o) => !o && close()}
        character={character}
        update={update}
      />
      {popup?.kind === 'ac' && (
        <AcDialog
          open
          onOpenChange={close}
          character={character}
          update={update}
          initialTab={popup.tab}
        />
      )}
      {popup?.kind === 'saves' && (
        <SavesDialog
          open
          onOpenChange={close}
          character={character}
          update={update}
          initialTab={popup.tab}
        />
      )}
      {popup?.kind === 'manobras' && (
        <ManobrasDialog
          open
          onOpenChange={close}
          character={character}
          update={update}
          initialTab={popup.tab}
        />
      )}
      {popup?.kind === 'weapon' && (
        <WeaponDetailDialog
          open
          onOpenChange={close}
          weaponId={popup.id}
          character={character}
          update={update}
        />
      )}
      <WeaponPickDialog
        open={popup?.kind === 'weaponPick'}
        onOpenChange={(o) => !o && close()}
        weapons={library?.armas ?? []}
        onPick={(w) => {
          update((c) => addWeaponFromLibrary(c, w));
          close();
        }}
        onCreateNew={() => setPopup({ kind: 'weaponLibraryAdd' })}
      />
      <WeaponLibraryAddDialog
        open={popup?.kind === 'weaponLibraryAdd'}
        onOpenChange={(o) => !o && close()}
        onSubmit={(weapon) => {
          const id = crypto.randomUUID();
          addWeaponToLibrary(systemId, { ...weapon, id });
          update((c) => addWeaponFromLibrary(c, { ...weapon, id }));
          close();
        }}
      />
    </div>
  );
}

function Row({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string | number;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex items-center justify-between text-left">
      <span className="text-sm text-neutral-300">{label}</span>
      <span className="text-lg font-semibold text-neutral-100">{value}</span>
    </button>
  );
}
