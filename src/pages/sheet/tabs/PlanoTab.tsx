import { CheckCircle2, Plus } from 'lucide-react';
import { EmptyState } from '@/shared/ui/molecules/EmptyState';
import { Button } from '@/shared/ui/atoms/Button';

export function PlanoTab() {
  return (
    <EmptyState
      icon={<CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />}
      title="Nenhum plano criado"
      description="Planeje talentos, perícias e habilidades dos próximos níveis antes de upar."
      action={
        <Button variant="secondary" size="sm" className="mt-1">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Criar plano
        </Button>
      }
    />
  );
}
