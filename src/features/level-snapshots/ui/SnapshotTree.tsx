import { History, TrendingUp } from 'lucide-react';
import type { LevelSnapshot } from '@/entities/character/model/types';
import { cn } from '@/shared/lib/cn';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR');
}

function Node({
  snapshot,
  depth,
  childrenByParent,
  currentSnapshotId,
  viewingId,
  onSelect,
}: {
  snapshot: LevelSnapshot;
  depth: number;
  childrenByParent: Map<string | null, LevelSnapshot[]>;
  currentSnapshotId: string | null;
  viewingId: string;
  onSelect: (id: string) => void;
}) {
  const kids = childrenByParent.get(snapshot.id) ?? [];
  const isCurrent = snapshot.id === currentSnapshotId;
  const isViewing = snapshot.id === viewingId;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(snapshot.id)}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg py-2 pr-3 text-left text-xs transition',
          isViewing ? 'bg-amber-950/30 text-amber-300' : 'text-neutral-300 hover:bg-neutral-800/60',
        )}
      >
        {snapshot.kind === 'restore-point' ? (
          <History className="h-3.5 w-3.5 shrink-0 text-sky-400" strokeWidth={2} />
        ) : (
          <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2} />
        )}
        <span className="min-w-0 flex-1 truncate">{snapshot.label}</span>
        {isCurrent && (
          <span className="shrink-0 rounded-full bg-emerald-900/50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
            atual
          </span>
        )}
        <span className="shrink-0 text-[10px] text-neutral-600">{formatDate(snapshot.date)}</span>
      </button>
      {kids.map((kid) => (
        <Node
          key={kid.id}
          snapshot={kid}
          depth={depth + 1}
          childrenByParent={childrenByParent}
          currentSnapshotId={currentSnapshotId}
          viewingId={viewingId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

/**
 * Full fork/tree view of every non-deleted snapshot — restoring an older one forks the timeline,
 * so this is a tree, not a flat list; this is what lets you see the whole shape of that history
 * at once, including branches the "linha do tempo atual" / "outros ramos" tabs split apart.
 */
export function SnapshotTree({
  snapshots,
  currentSnapshotId,
  viewingId,
  onSelect,
}: {
  snapshots: LevelSnapshot[];
  currentSnapshotId: string | null;
  viewingId: string;
  onSelect: (id: string) => void;
}) {
  const visible = snapshots.filter((s) => !s.deletedAt);
  const childrenByParent = new Map<string | null, LevelSnapshot[]>();
  for (const snap of visible) {
    const list = childrenByParent.get(snap.parentId) ?? [];
    list.push(snap);
    childrenByParent.set(snap.parentId, list);
  }
  const roots = childrenByParent.get(null) ?? [];

  if (roots.length === 0) {
    return <p className="text-xs text-neutral-600">Nenhum snapshot ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-0.5">
      {roots.map((root) => (
        <Node
          key={root.id}
          snapshot={root}
          depth={0}
          childrenByParent={childrenByParent}
          currentSnapshotId={currentSnapshotId}
          viewingId={viewingId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
