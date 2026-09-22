import { useCharacter } from '@/app/providers';
import { SectionCard } from '@/shared/ui/molecules/SectionCard';
import { effectiveLevel } from '@/entities/character/model/calculations';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

export function HistoricoTab({ characterId }: { characterId: string }) {
  const { character } = useCharacter(characterId);
  const currentLevel = effectiveLevel(character.classes);

  return (
    <div className="flex flex-col gap-5">
      <SectionCard>
        <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
          Snapshots por nível
        </h3>
        <div className="flex flex-col gap-2">
          {character.levelSnapshots.map((snap) => {
            const isCurrent = snap.level === currentLevel;
            return (
              <div
                key={snap.id}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${isCurrent ? 'border border-amber-800/30 bg-amber-950/30' : 'bg-neutral-950'}`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isCurrent ? 'text-ink bg-amber-600' : 'bg-neutral-800 text-amber-400'}`}
                >
                  {snap.level}
                </span>
                <p
                  className={`flex-1 text-sm ${isCurrent ? 'text-neutral-200' : 'text-neutral-300'}`}
                >
                  {snap.label}
                </p>
                <span className={`text-xs ${isCurrent ? 'text-neutral-500' : 'text-neutral-600'}`}>
                  {formatDate(snap.date)}
                </span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Registro de sessões{' '}
            <span className="text-neutral-600">({character.sessionLog.length} sessões)</span>
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
    </div>
  );
}
