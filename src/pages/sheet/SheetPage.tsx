import { useCharacter } from '@/app/providers';
import { useNavigation } from '@/shared/lib/navigation';
import { Breadcrumbs } from '@/widgets/app-shell';

export interface SheetPageProps {
  characterId: string;
  initialTab?: string;
}

export function SheetPage({ characterId }: SheetPageProps) {
  const { character } = useCharacter(characterId);
  const { goDashboard, goSystems, goCharacters } = useNavigation();

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
      <h1 className="font-display text-2xl text-neutral-100">{character.name}</h1>
      <p className="mt-2 text-sm text-neutral-500">Ficha completa em construção.</p>
    </main>
  );
}
