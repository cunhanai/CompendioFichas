import { ArrowUpCircle } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { alignmentFull, effectiveLevel } from '@/entities/character/model/calculations';
import { ALIGNMENT_LAWS, ALIGNMENT_MORALS, SIZES } from '@/entities/character/model/constants';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { FieldView } from '@/shared/ui/molecules/FieldView';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { IconButton } from '@/shared/ui/atoms/IconButton';
import { TextField } from '@/shared/ui/atoms/TextField';
import { UnitInput } from '@/shared/ui/atoms/UnitInput';
import { cn } from '@/shared/lib/cn';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { setAlignmentLaw, setAlignmentMoral, updateIdentity } from '../model/mutations';

export interface IdentityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
  onOpenLevelUp: () => void;
}

const pillBase = 'rounded-lg px-2.5 py-1.5 text-xs font-medium transition';
const pillOn = cn(pillBase, 'bg-amber-500 text-ink');
const pillOff = cn(
  pillBase,
  'border border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-neutral-600',
);

export function IdentityDialog({
  open,
  onOpenChange,
  character,
  update,
  onOpenLevelUp,
}: IdentityDialogProps) {
  const { identity } = character;
  const isEmpty =
    !identity.raca &&
    !identity.sexo &&
    !identity.cabelo &&
    !identity.olhos &&
    !identity.divindade &&
    !identity.terraNatal &&
    identity.idadeNum === 0 &&
    identity.alturaNum === 0 &&
    identity.pesoNum === 0;
  const {
    editing,
    setEditing,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
    update: trackedUpdate,
  } = useEditableSection({ open, isEmpty, character, update, onOpenChange });

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="Identidade"
        size="lg"
        headerActions={
          character.active && (
            <>
              <EditToggleButton
                editing={editing}
                onToggle={() => setEditing(!editing)}
                label="Editar identidade"
              />
              <IconButton label="Upar de nível" variant="amber" onClick={onOpenLevelUp}>
                <ArrowUpCircle className="h-4 w-4" strokeWidth={2} />
              </IconButton>
            </>
          )
        }
      >
        {!editing ? (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
              <FieldView
                label="Tendência"
                value={alignmentFull(character.alignmentLaw, character.alignmentMoral)}
              />
              <FieldView label="Raça" value={identity.raca} />
              <FieldView label="Sexo" value={identity.sexo} />
              <FieldView label="Tamanho" value={identity.tamanho} />
              <FieldView label="Idade" value={`${identity.idadeNum} anos`} />
              <FieldView
                label="Altura"
                value={`${String(identity.alturaNum).replace('.', ',')} m`}
              />
              <FieldView label="Peso" value={`${String(identity.pesoNum).replace('.', ',')} kg`} />
              <FieldView label="Cabelo" value={identity.cabelo} />
              <FieldView label="Olhos" value={identity.olhos} />
              <FieldView label="Divindade" value={identity.divindade} />
              <FieldView label="Terra natal" value={identity.terraNatal} />
            </div>
            <div className="mt-5 border-t border-neutral-800/70 pt-5">
              <span className="mb-2 block text-[11px] tracking-wider text-neutral-500 uppercase">
                Classes e níveis
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {character.classes.length === 0 ? (
                  <span className="rounded-full bg-neutral-800 px-3 py-1.5 text-sm text-neutral-500">
                    Sem classe
                  </span>
                ) : (
                  character.classes.map((cls) => (
                    <span
                      key={cls.id}
                      className="rounded-full bg-neutral-800 px-3 py-1.5 text-sm text-neutral-200"
                    >
                      {cls.name} <b className="text-amber-400">{cls.level}</b>
                    </span>
                  ))
                )}
                <span className="flex items-center gap-2 text-sm text-neutral-400 sm:ml-auto">
                  Nível efetivo:{' '}
                  <b className="text-base text-neutral-100">{effectiveLevel(character.classes)}</b>
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <span className="mb-1 block text-xs text-neutral-500">Tendência (ordem)</span>
              <div className="mb-2 flex gap-2">
                {ALIGNMENT_LAWS.map((law) => (
                  <button
                    key={law}
                    className={character.alignmentLaw === law ? pillOn : pillOff}
                    onClick={() => trackedUpdate((c) => setAlignmentLaw(c, law))}
                  >
                    {law} ({law[0]})
                  </button>
                ))}
              </div>
              <span className="mb-1 block text-xs text-neutral-500">Tendência (moral)</span>
              <div className="flex gap-2">
                {ALIGNMENT_MORALS.map((moral) => (
                  <button
                    key={moral}
                    className={character.alignmentMoral === moral ? pillOn : pillOff}
                    onClick={() => trackedUpdate((c) => setAlignmentMoral(c, moral))}
                  >
                    {moral} ({moral[0]})
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1 block text-xs text-neutral-500">Tamanho</span>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    className={identity.tamanho === size ? pillOn : pillOff}
                    onClick={() => trackedUpdate((c) => updateIdentity(c, { tamanho: size }))}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Raça"
                value={identity.raca}
                onChange={(e) => trackedUpdate((c) => updateIdentity(c, { raca: e.target.value }))}
              />
              <TextField
                label="Sexo"
                value={identity.sexo}
                onChange={(e) => trackedUpdate((c) => updateIdentity(c, { sexo: e.target.value }))}
              />
              <UnitInput
                label="Idade"
                unit="anos"
                value={identity.idadeNum}
                onChange={(e) =>
                  trackedUpdate((c) => updateIdentity(c, { idadeNum: Number(e.target.value) || 0 }))
                }
              />
              <UnitInput
                label="Altura"
                unit="m"
                step={0.01}
                value={identity.alturaNum}
                onChange={(e) =>
                  trackedUpdate((c) =>
                    updateIdentity(c, { alturaNum: Number(e.target.value) || 0 }),
                  )
                }
              />
              <UnitInput
                label="Peso"
                unit="kg"
                value={identity.pesoNum}
                onChange={(e) =>
                  trackedUpdate((c) => updateIdentity(c, { pesoNum: Number(e.target.value) || 0 }))
                }
              />
              <TextField
                label="Cabelo"
                value={identity.cabelo}
                onChange={(e) =>
                  trackedUpdate((c) => updateIdentity(c, { cabelo: e.target.value }))
                }
              />
              <TextField
                label="Olhos"
                value={identity.olhos}
                onChange={(e) => trackedUpdate((c) => updateIdentity(c, { olhos: e.target.value }))}
              />
              <TextField
                label="Divindade"
                value={identity.divindade}
                onChange={(e) =>
                  trackedUpdate((c) => updateIdentity(c, { divindade: e.target.value }))
                }
              />
              <div className="col-span-2">
                <TextField
                  label="Terra natal"
                  value={identity.terraNatal}
                  onChange={(e) =>
                    trackedUpdate((c) => updateIdentity(c, { terraNatal: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        )}
      </Popup>
      <UnsavedChangesDialog
        open={confirmingClose}
        onOpenChange={(o) => !o && cancelClose()}
        onSave={keepChanges}
        onDiscard={discardChanges}
      />
    </>
  );
}
