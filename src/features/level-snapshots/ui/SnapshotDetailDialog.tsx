import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { classesSummary, effectiveLevel } from '@/entities/character/model/calculations';
import {
  deleteSnapshot,
  isSnapshotProtected,
  restoreSnapshot,
} from '@/entities/character/model/snapshots';
import { Popup } from '@/shared/ui/organisms/Popup';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { Button } from '@/shared/ui/atoms/Button';
import { SnapshotTree } from './SnapshotTree';

export interface SnapshotDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
  snapshotId: string;
  onSelectSnapshot: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}

/** Details for one snapshot: what it holds, where it sits in the fork tree, and — for anything
 * that isn't the live state — the option to restore it or (if not on the active lineage) delete
 * it for good. */
export function SnapshotDetailDialog({
  open,
  onOpenChange,
  character,
  update,
  snapshotId,
  onSelectSnapshot,
}: SnapshotDetailDialogProps) {
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const snapshot = character.levelSnapshots.find((s) => s.id === snapshotId);
  if (!snapshot || snapshot.data == null) return null;

  const isCurrent = snapshotId === character.currentSnapshotId;
  const protectedSnapshot = isSnapshotProtected(character, snapshotId);

  return (
    <>
      <Popup open={open} onOpenChange={onOpenChange} title={snapshot.label} size="md">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Nível efetivo" value={String(effectiveLevel(snapshot.data.classes))} />
            <Stat label="PV" value={`${snapshot.data.hpCurrent}/${snapshot.data.hpMax}`} />
            <Stat
              label="Classes"
              value={classesSummary(snapshot.data.classes) || 'Sem classe'}
              className="col-span-2"
            />
            <Stat
              label="Data"
              value={formatDate(snapshot.date)}
              className="col-span-2 sm:col-span-4"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {!isCurrent && (
              <Button className="flex-1" onClick={() => setConfirmRestore(true)}>
                <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                Restaurar esta versão
              </Button>
            )}
            {!protectedSnapshot && (
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4 text-rose-400" strokeWidth={1.8} />
                Excluir
              </Button>
            )}
          </div>
          {protectedSnapshot && (
            <p className="-mt-3 text-[11px] text-neutral-600">
              Faz parte da linha do tempo atual — não pode ser excluída.
            </p>
          )}

          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              Árvore de snapshots
            </h3>
            <SnapshotTree
              snapshots={character.levelSnapshots}
              currentSnapshotId={character.currentSnapshotId}
              viewingId={snapshotId}
              onSelect={onSelectSnapshot}
            />
          </div>
        </div>
      </Popup>

      <ConfirmDialog
        open={confirmRestore}
        onOpenChange={setConfirmRestore}
        title="Restaurar esta versão?"
        message="A ficha atual vai virar exatamente como estava neste snapshot. O estado atual não se perde — vira um novo ramo no histórico, que você pode consultar (ou excluir) depois."
        confirmLabel="Restaurar"
        onConfirm={() => {
          update((c) => restoreSnapshot(c, snapshotId));
          setConfirmRestore(false);
          onOpenChange(false);
        }}
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Excluir este snapshot?"
        message="Ele sai da lista, mas fica guardado — nada é apagado de verdade."
        confirmLabel="Excluir"
        onConfirm={() => {
          update((c) => deleteSnapshot(c, snapshotId));
          setConfirmDelete(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-lg bg-neutral-950 px-3 py-2.5 ${className ?? ''}`}>
      <p className="text-[10px] text-neutral-500">{label}</p>
      <p className="truncate text-sm font-medium text-neutral-100">{value}</p>
    </div>
  );
}
