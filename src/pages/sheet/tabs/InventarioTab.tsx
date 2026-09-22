import { useState } from 'react';
import { Coins, Plus, X } from 'lucide-react';
import { useCharacter } from '@/app/providers';
import { computeCarriedWeight, loadState } from '@/entities/character/model/calculations';
import {
  AddArmorItemDialog,
  AddEquipmentDialog,
  LoadDialog,
  MoneyDialog,
  addArmorItem,
  addEquipment,
  removeArmorItem,
  removeEquipment,
} from '@/features/inventory';
import {
  SectionCard,
  SectionCardButton,
  SectionCardHeader,
} from '@/shared/ui/molecules/SectionCard';

type Popup = 'money' | 'load' | 'addEquipment' | 'addArmor' | null;

export function InventarioTab({ characterId }: { characterId: string }) {
  const { character, update } = useCharacter(characterId);
  const [popup, setPopup] = useState<Popup>(null);
  const close = () => setPopup(null);

  const carried = computeCarriedWeight(character);

  return (
    <div className="flex flex-col gap-5">
      <SectionCardButton onClick={() => setPopup('money')}>
        <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          <Coins className="h-3.5 w-3.5" strokeWidth={1.8} />
          Dinheiro
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <Coin value={character.money.pc} label="PC" color="text-orange-300" />
          <Coin value={character.money.pp} label="PP" color="text-neutral-300" />
          <Coin value={character.money.po} label="PO" color="text-amber-400" />
          <Coin value={character.money.pl} label="PL" color="text-sky-300" />
        </div>
      </SectionCardButton>

      <SectionCardButton onClick={() => setPopup('load')}>
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Carga
        </h3>
        <div className="mb-3 flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full bg-emerald-500"
              style={{
                width: `${character.load.heavy ? Math.min(100, Math.round((carried / character.load.heavy) * 100)) : 0}%`,
              }}
            />
          </div>
          <span className="shrink-0 text-xs text-neutral-400">
            {String(carried).replace('.', ',')} kg — carga {loadState(carried, character.load)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 text-center sm:grid-cols-3">
          <Field label="Leve" value={`${character.load.light} kg`} />
          <Field label="Média" value={`${character.load.medium} kg`} />
          <Field label="Pesada" value={`${character.load.heavy} kg`} />
          <Field label="Erguer sobre a cabeça" value={`${character.load.overhead} kg`} />
          <Field label="Erguer do chão" value={`${character.load.ground} kg`} />
          <Field label="Arrastar/empurrar" value={`${character.load.drag} kg`} />
        </div>
      </SectionCardButton>

      <SectionCard>
        <SectionCardHeader
          title="Equipamentos"
          action={
            <button
              type="button"
              onClick={() => setPopup('addEquipment')}
              className="text-amber-500 hover:text-amber-400"
            >
              <Plus className="h-4.5 w-4.5" strokeWidth={2} />
            </button>
          }
        />
        <div className="flex flex-col divide-y divide-neutral-800/70">
          {character.equipment.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className="text-neutral-200">{item.name}</span>
              <span className="flex items-center gap-2 text-neutral-500">
                {item.qty} × {item.unitWeight} kg ={' '}
                {(item.qty * item.unitWeight).toFixed(2).replace(/\.?0+$/, '')} kg
                {character.active && (
                  <button
                    title="Remover"
                    onClick={() => update((c) => removeEquipment(c, item.id))}
                    className="text-neutral-600 hover:text-rose-400"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <SectionCardHeader
          title="Itens de CA"
          action={
            <button
              type="button"
              onClick={() => setPopup('addArmor')}
              className="text-amber-500 hover:text-amber-400"
            >
              <Plus className="h-4.5 w-4.5" strokeWidth={2} />
            </button>
          }
        />
        <div className="flex flex-col gap-2.5">
          {character.armorItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-2 gap-2 rounded-lg bg-neutral-950 px-4 py-3 text-xs sm:grid-cols-4"
            >
              <span className="col-span-2 text-sm font-medium text-neutral-200 sm:col-span-1">
                {item.name}
              </span>
              <span className="text-neutral-500">Bônus +{item.bonus}</span>
              <span className="text-neutral-500">Penalidade −{Math.abs(item.checkPenalty)}</span>
              <span className="flex items-center gap-2 text-neutral-500">
                Falha {item.arcaneFailure}% · {item.weight} kg
                {character.active && (
                  <button
                    title="Remover"
                    onClick={() => update((c) => removeArmorItem(c, item.id))}
                    className="text-neutral-600 hover:text-rose-400"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <MoneyDialog
        open={popup === 'money'}
        onOpenChange={(o) => !o && close()}
        character={character}
        update={update}
      />
      <LoadDialog
        open={popup === 'load'}
        onOpenChange={(o) => !o && close()}
        character={character}
        update={update}
      />
      <AddEquipmentDialog
        open={popup === 'addEquipment'}
        onOpenChange={(o) => !o && close()}
        onSubmit={(item) => {
          update((c) => addEquipment(c, item));
          close();
        }}
      />
      <AddArmorItemDialog
        open={popup === 'addArmor'}
        onOpenChange={(o) => !o && close()}
        onSubmit={(item) => {
          update((c) => addArmorItem(c, item));
          close();
        }}
      />
    </div>
  );
}

function Coin({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-950 py-2.5 text-center">
      <p className={`text-base font-semibold ${color}`}>{value}</p>
      <p className="text-[10px] text-neutral-500">{label}</p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-neutral-950 py-2">
      <p className="text-sm font-medium text-neutral-100">{value}</p>
      <p className="text-[10px] text-neutral-500">{label}</p>
    </div>
  );
}
