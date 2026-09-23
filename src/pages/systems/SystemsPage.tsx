import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import { SystemCard } from '@/entities/system/ui/SystemCard';
import { getSystemStatus } from '@/entities/system/model/selectors';
import { Breadcrumbs } from '@/widgets/app-shell';

export function SystemsPage() {
  const { systems, characters } = useAppData();
  const navigate = useNavigate();

  const withStatus = systems.map((s) => ({
    system: s,
    status: getSystemStatus(
      s,
      characters.some((c) => c.systemId === s.id && c.active),
    ),
  }));

  const favorite = withStatus.find((s) => s.system.favorited);
  const active = withStatus.filter((s) => !s.system.favorited && s.status === 'active');
  const inactive = withStatus.filter((s) => !s.system.favorited && s.status === 'inactive');
  const soon = withStatus.filter((s) => s.status === 'soon');

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 md:px-10 md:py-10">
      <Breadcrumbs
        items={[
          { label: 'Início', onClick: () => navigate(routes.dashboard()) },
          { label: 'Sistemas' },
        ]}
      />
      <h1 className="font-display mb-6 text-2xl text-neutral-100">Seus sistemas</h1>

      {favorite && (
        <div className="mb-6">
          <h2 className="mb-2.5 text-xs font-semibold tracking-wider text-amber-500/80 uppercase">
            Favorito
          </h2>
          <SystemCard
            variant="wide"
            title={favorite.system.title}
            status={favorite.status}
            favorited={favorite.system.favorited}
            logoUrl={favorite.system.logoUrl}
            onOpen={() => navigate(routes.characters(favorite.system.id))}
          />
        </div>
      )}

      <div className="mb-6">
        <h2 className="mb-2.5 text-xs font-semibold tracking-wider text-emerald-500/80 uppercase">
          Ativos
        </h2>
        {active.length === 0 ? (
          <p className="text-xs text-neutral-600">Nenhum outro sistema ativo no momento.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {active.map(({ system, status }) => (
              <SystemCard
                key={system.id}
                variant="wide"
                title={system.title}
                status={status}
                favorited={system.favorited}
                logoUrl={system.logoUrl}
                onOpen={() => navigate(routes.characters(system.id))}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-2.5 text-xs font-semibold tracking-wider text-neutral-600 uppercase">
          Inativos
        </h2>
        <div className="mb-2 flex flex-col gap-2">
          {inactive.map(({ system, status }) => (
            <SystemCard
              key={system.id}
              variant="wide"
              title={system.title}
              status={status}
              favorited={system.favorited}
              logoUrl={system.logoUrl}
              onOpen={() => navigate(routes.characters(system.id))}
            />
          ))}
        </div>

        {soon.length > 0 && (
          <>
            <p className="mt-4 mb-1.5 text-xs text-neutral-600">Em breve neste compêndio</p>
            <div className="flex flex-col gap-2 opacity-50">
              {soon.map(({ system, status }) => (
                <SystemCard
                  key={system.id}
                  variant="wide"
                  title={system.title}
                  status={status}
                  favorited={system.favorited}
                  logoUrl={system.logoUrl}
                  onOpen={() => {}}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
