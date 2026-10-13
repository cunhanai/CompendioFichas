import { useNavigate } from 'react-router-dom';
import { routes } from '@/shared/lib/routes';
import { Breadcrumbs } from '@/widgets/app-shell';
import { Badge } from '@/shared/ui/atoms/Badge';
import { CHANGELOG_ENTRIES } from '@/entities/changelog/model/data';

export function ChangelogPage() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6 md:px-10 md:py-10">
      <Breadcrumbs
        items={[
          { label: 'Início', onClick: () => navigate(routes.dashboard()) },
          { label: 'Novidades' },
        ]}
      />

      <h1 className="font-display mb-6 text-2xl text-neutral-100">Novidades</h1>

      <div className="flex flex-col gap-6">
        {CHANGELOG_ENTRIES.map((entry) => (
          <div key={entry.version} className="rounded-lg bg-neutral-900 p-5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-neutral-100">{entry.title}</h2>
              <Badge tone="sky" size="sm" className="shrink-0">
                {entry.version}
              </Badge>
            </div>
            <p className="mb-3 text-xs text-neutral-500">
              {new Date(entry.date).toLocaleDateString('pt-BR')}
            </p>
            <ul className="flex flex-col gap-1.5">
              {entry.changes.map((change) => (
                <li key={change} className="text-sm leading-relaxed text-neutral-300">
                  • {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
