import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useCharacter } from '@/app/providers';
import { SectionCard } from '@/shared/ui/molecules/SectionCard';
import { FeatureTag } from '@/shared/ui/atoms/FeatureTag';
import { PillTabs } from '@/shared/ui/molecules/PillTabs';
import { Button } from '@/shared/ui/atoms/Button';
import type { LevelSnapshot } from '@/entities/character/model/types';
import {
  activeLineage,
  otherBranches,
  takeManualSnapshot,
} from '@/entities/character/model/snapshots';
import { SnapshotDetailDialog } from '@/features/level-snapshots';
import {
  SNAPSHOT_KIND_COLOR,
  SNAPSHOT_KIND_ICON,
} from '@/features/level-snapshots/model/snapshotDisplay';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

function SnapshotRow({
  snapshot,
  isCurrent,
  onOpen,
}: {
  snapshot: LevelSnapshot;
  isCurrent: boolean;
  onOpen: () => void;
}) {
  const Icon = SNAPSHOT_KIND_ICON[snapshot.kind];
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left transition ${isCurrent ? 'border border-amber-800/30 bg-amber-950/30' : 'bg-neutral-950 hover:bg-neutral-900'}`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isCurrent ? 'text-ink bg-amber-600' : 'bg-neutral-800 text-amber-400'}`}
      >
        {snapshot.level}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`flex items-center gap-1.5 text-sm ${isCurrent ? 'text-neutral-200' : 'text-neutral-300'}`}
        >
          <Icon
            className={`h-3.5 w-3.5 shrink-0 ${SNAPSHOT_KIND_COLOR[snapshot.kind]}`}
            strokeWidth={2}
          />
          <span className="truncate">{snapshot.label}</span>
        </span>
      </span>
      {isCurrent && (
        <span className="shrink-0 rounded-full bg-emerald-900/50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
          atual
        </span>
      )}
      <span className={`shrink-0 text-xs ${isCurrent ? 'text-neutral-500' : 'text-neutral-600'}`}>
        {formatDate(snapshot.date)}
      </span>
    </button>
  );
}

export function HistoricoTab({ characterId }: { characterId: string }) {
  const { character, update } = useCharacter(characterId);
  const [tab, setTab] = useState<'atual' | 'ramos'>('atual');
  const [openSnapshotId, setOpenSnapshotId] = useState<string | null>(null);

  const lineage = activeLineage(character);
  const branches = otherBranches(character);

  return (
    <div className="flex flex-col gap-5">
      <SectionCard>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Snapshots por nível
            <FeatureTag status="em-desenvolvimento" />
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {character.active && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => update((c) => takeManualSnapshot(c))}
              >
                <Camera className="h-4 w-4" strokeWidth={1.8} />
                Tirar snapshot agora
              </Button>
            )}
            <PillTabs
              value={tab}
              onValueChange={setTab}
              options={[
                { value: 'atual', label: 'Linha do tempo atual' },
                {
                  value: 'ramos',
                  label: `Outros ramos${branches.length > 0 ? ` (${branches.length})` : ''}`,
                },
              ]}
            />
          </div>
        </div>

        {tab === 'atual' ? (
          lineage.length === 0 ? (
            <p className="text-xs text-neutral-600">
              Nenhum snapshot ainda — o primeiro é criado automaticamente quando o personagem sobe
              de nível.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...lineage].reverse().map((snap) => (
                <SnapshotRow
                  key={snap.id}
                  snapshot={snap}
                  isCurrent={snap.id === character.currentSnapshotId}
                  onOpen={() => setOpenSnapshotId(snap.id)}
                />
              ))}
            </div>
          )
        ) : branches.length === 0 ? (
          <p className="text-xs text-neutral-600">
            Nenhum outro ramo — eles aparecem aqui depois que você restaura um snapshot antigo,
            guardando o que ficou pra trás.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...branches].reverse().map((snap) => (
              <SnapshotRow
                key={snap.id}
                snapshot={snap}
                isCurrent={false}
                onOpen={() => setOpenSnapshotId(snap.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Registro de sessões{' '}
            <span className="text-neutral-600">({character.sessionLog.length} sessões)</span>
            <FeatureTag status="em-desenvolvimento" />
          </h3>
        </div>
        {character.sessionLog.length === 0 ? (
          <p className="text-xs text-neutral-600">Nenhuma sessão registrada ainda.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {character.sessionLog.map((sess) => (
              <div key={sess.id} className="rounded-lg bg-neutral-950 px-4 py-3.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-200">{sess.title}</span>
                  <span className="text-xs text-neutral-600">{formatDate(sess.date)}</span>
                </div>
                <p className="text-xs leading-relaxed text-neutral-400">{sess.summary}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {openSnapshotId && (
        <SnapshotDetailDialog
          open
          onOpenChange={(o) => !o && setOpenSnapshotId(null)}
          character={character}
          update={update}
          snapshotId={openSnapshotId}
          onSelectSnapshot={setOpenSnapshotId}
        />
      )}
    </div>
  );
}
