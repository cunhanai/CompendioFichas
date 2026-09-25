import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { SpellcastingBlock } from '@/entities/character/model/types';
import { SectionCard } from '@/shared/ui/molecules/SectionCard';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { IconButton } from '@/shared/ui/atoms/IconButton';

const KIND_DESC: Record<SpellcastingBlock['kind'], string> = {
  espontânea: 'Conhece magias fixas por nível e gasta de um pool de espaços por nível.',
  preparada:
    'Escolhe magias do círculo disponível para preparar antes do dia; pode repetir a mesma.',
};

export function SpellBookCard({
  book,
  onSearch,
  onOpenSpell,
  onSetCircleMax,
  onRemove,
}: {
  book: SpellcastingBlock;
  onSearch: () => void;
  onOpenSpell: (name: string) => void;
  onSetCircleMax: (circleIndex: number, max: number) => void;
  onRemove: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  return (
    <SectionCard>
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="min-w-0 text-sm font-semibold text-neutral-100">
          Magias {book.kind} — {book.className}{' '}
          <span className="font-normal text-neutral-500">({book.abilityLabel})</span>
        </h3>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onSearch}
            className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Buscar magia
          </button>
          <IconButton
            label={editing ? 'Concluir edição' : 'Editar espaços de magia'}
            variant={editing ? 'amber' : 'neutral'}
            size="sm"
            onClick={() => setEditing((e) => !e)}
          >
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
          </IconButton>
          {editing && (
            <IconButton
              label="Remover grimório"
              variant="neutral"
              size="sm"
              onClick={() => setConfirmRemove(true)}
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" strokeWidth={1.8} />
            </IconButton>
          )}
        </div>
      </div>
      <p className="mb-4 text-xs text-neutral-500">{KIND_DESC[book.kind]}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">{book.cantrips.label}</span>
            <span className="text-xs text-neutral-500">ilimitado</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {book.cantrips.spells.map((name) => (
              <span
                key={name}
                className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
        {book.circles.map((circle, circleIndex) => (
          <div key={circle.label}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-neutral-400">{circle.label}</span>
              {editing ? (
                <span className="flex items-center gap-1 text-xs text-neutral-300">
                  {circle.used}/
                  <input
                    type="number"
                    min={0}
                    value={circle.max}
                    onChange={(e) => onSetCircleMax(circleIndex, Number(e.target.value) || 0)}
                    className="w-10 rounded border border-neutral-700 bg-neutral-950 px-1 py-0.5 text-center text-xs text-neutral-100 outline-none focus:border-amber-500"
                  />
                </span>
              ) : (
                <span className="text-xs text-neutral-300">
                  {circle.used}/{circle.max} usados
                </span>
              )}
            </div>
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full bg-amber-500"
                style={{
                  width: `${circle.max ? Math.round((circle.used / circle.max) * 100) : 0}%`,
                }}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {circle.spells.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => onOpenSpell(name)}
                  className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-700"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remover grimório?"
        message={`Isso remove o grimório de ${book.kind} de ${book.className} e todas as magias registradas nele.`}
        confirmLabel="Remover"
        onConfirm={() => {
          setConfirmRemove(false);
          onRemove();
        }}
      />
    </SectionCard>
  );
}
