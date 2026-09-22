import { PawPrint, Plus } from 'lucide-react';
import { EmptyState } from '@/shared/ui/molecules/EmptyState';
import { Button } from '@/shared/ui/atoms/Button';

export function CriaturasTab() {
  return (
    <EmptyState
      icon={<PawPrint className="h-8 w-8" strokeWidth={1.5} />}
      title="Nenhuma criatura vinculada"
      description="Familiares, companheiros animais, montarias e invocações aparecem aqui."
      action={
        <Button variant="secondary" size="sm" className="mt-1">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Vincular criatura
        </Button>
      }
    />
  );
}
