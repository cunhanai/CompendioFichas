import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useCharacter } from '@/app/providers';
import type { SheetTabId } from '@/entities/character/model/constants';
import { routes } from '@/shared/lib/routes';
import { Breadcrumbs } from '@/widgets/app-shell';
import { SheetHeader } from '@/widgets/sheet-header';
import { QuickStats } from '@/widgets/quick-stats';
import { SheetTabBar } from './SheetTabBar';
import { GeralTab } from './tabs/GeralTab';
import { CombateTab } from './tabs/CombateTab';
import { PericiasTab } from './tabs/PericiasTab';
import { MagiasTab } from './tabs/MagiasTab';
import { TalentosTab } from './tabs/TalentosTab';
import { InventarioTab } from './tabs/InventarioTab';
import { CriaturasTab } from './tabs/CriaturasTab';
import { PlanoTab } from './tabs/PlanoTab';
import { HistoricoTab } from './tabs/HistoricoTab';

function isSheetTabId(value: string): value is SheetTabId {
  return (
    value === 'geral' ||
    value === 'combate' ||
    value === 'pericias' ||
    value === 'magias' ||
    value === 'talentos' ||
    value === 'inventario' ||
    value === 'criaturas' ||
    value === 'plano' ||
    value === 'historico'
  );
}

export function SheetPage() {
  const { characterId = '' } = useParams<{ characterId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { character } = useCharacter(characterId);
  const [tab, setTab] = useState<SheetTabId>(() => {
    const initialTab = searchParams.get('aba');
    return initialTab && isSheetTabId(initialTab) ? initialTab : 'geral';
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-10 md:py-8">
      <Breadcrumbs
        items={[
          { label: 'Início', onClick: () => navigate(routes.dashboard()) },
          { label: 'Sistemas', onClick: () => navigate(routes.systems()) },
          {
            label: character.systemId,
            onClick: () => navigate(routes.characters(character.systemId)),
          },
          { label: character.name },
        ]}
      />

      <SheetHeader
        characterId={characterId}
        onBack={() => navigate(routes.characters(character.systemId))}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <QuickStats characterId={characterId} />

        <div className="flex flex-col gap-5">
          <SheetTabBar active={tab} onChange={setTab} />

          {tab === 'geral' && <GeralTab characterId={characterId} />}
          {tab === 'combate' && (
            <CombateTab characterId={characterId} systemId={character.systemId} />
          )}
          {tab === 'pericias' && <PericiasTab characterId={characterId} />}
          {tab === 'magias' && (
            <MagiasTab characterId={characterId} systemId={character.systemId} />
          )}
          {tab === 'talentos' && (
            <TalentosTab characterId={characterId} systemId={character.systemId} />
          )}
          {tab === 'inventario' && <InventarioTab characterId={characterId} />}
          {tab === 'criaturas' && <CriaturasTab />}
          {tab === 'plano' && <PlanoTab />}
          {tab === 'historico' && <HistoricoTab characterId={characterId} />}
        </div>
      </div>
    </main>
  );
}
