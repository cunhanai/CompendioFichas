import { useState } from 'react';
import { useCharacter } from '@/app/providers';
import type { SheetTabId } from '@/entities/character/model/constants';
import { useNavigation } from '@/shared/lib/navigation';
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

export interface SheetPageProps {
  characterId: string;
  initialTab?: string;
}

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

export function SheetPage({ characterId, initialTab }: SheetPageProps) {
  const { character } = useCharacter(characterId);
  const { goDashboard, goSystems, goCharacters } = useNavigation();
  const [tab, setTab] = useState<SheetTabId>(() =>
    initialTab && isSheetTabId(initialTab) ? initialTab : 'geral',
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 md:px-10 md:py-8">
      <Breadcrumbs
        items={[
          { label: 'Início', onClick: goDashboard },
          { label: 'Sistemas', onClick: goSystems },
          { label: character.systemId, onClick: () => goCharacters(character.systemId) },
          { label: character.name },
        ]}
      />

      <SheetHeader characterId={characterId} onBack={() => goCharacters(character.systemId)} />

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
