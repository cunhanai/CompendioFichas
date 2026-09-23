import { Star } from 'lucide-react';
import { useAppData } from '@/app/providers';
import { useNavigation } from '@/shared/lib/navigation';
import { formatRelativeTime } from '@/shared/lib/format';
import { classesSummary } from '@/entities/character/model/calculations';
import { CharCard } from '@/entities/character/ui/CharCard';
import { SystemCard } from '@/entities/system/ui/SystemCard';
import { getSystemStatus } from '@/entities/system/model/selectors';
import { Avatar } from '@/shared/ui/atoms/Avatar';

export function DashboardPage() {
  const { user, systems, characters } = useAppData();
  const { goSheet, goSystems, goCharacters } = useNavigation();

  const favorite = characters.find((c) => c.favorited);
  const recent = [...characters]
    .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
    .slice(0, 3);

  const firstName = user.name.split(' ')[0];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-10 md:py-10">
      <h1 className="font-display mb-1 text-2xl text-neutral-100">Olá, {firstName}</h1>
      <p className="mb-8 text-sm text-neutral-500">Pronta para a próxima sessão?</p>

      {favorite && (
        <section className="mb-9">
          <h2 className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-amber-500/80 uppercase">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            Personagem favorito
          </h2>
          <CharCard
            name={favorite.name}
            subtitle={`${favorite.identity.raca} · ${classesSummary(favorite.classes)}`}
            hpCurrent={favorite.hpCurrent}
            hpMax={favorite.hpMax}
            favorited
            onOpen={() => goSheet(favorite.id)}
          />
        </section>
      )}

      <section className="mb-9">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Seus sistemas
          </h2>
          <button
            type="button"
            onClick={goSystems}
            className="text-xs font-medium text-amber-500 hover:text-amber-400"
          >
            Ver todos
          </button>
        </div>
        <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {systems.map((system) => (
            <SystemCard
              key={system.id}
              title={system.title}
              favorited={system.favorited}
              logoUrl={system.logoUrl}
              status={getSystemStatus(
                system,
                characters.some((c) => c.systemId === system.id && c.active),
              )}
              onOpen={() => goCharacters(system.id)}
            />
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Acessados recentemente
          </h2>
          <div className="flex flex-col gap-2">
            {recent.map((c) => {
              const system = systems.find((s) => s.id === c.systemId);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => goSheet(c.id)}
                  className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-left transition hover:bg-neutral-900"
                >
                  <Avatar size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-200">{c.name}</p>
                    <p className="text-xs text-neutral-500">
                      {system?.title} · {formatRelativeTime(c.lastAccessedAt)}
                    </p>
                  </div>
                  {c.favorited && (
                    <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
