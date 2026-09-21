import { useState } from 'react';
import { Circle, Download } from 'lucide-react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { PillTabs } from '@/shared/ui/molecules/PillTabs';
import { Button } from '@/shared/ui/atoms/Button';

export interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shared: boolean;
  shareSlug: string;
  onActivate: () => void;
  onStop: () => void;
}

/** "Compartilhar ficha" popup: Link público (ativar/copiar/parar) + Download (PDF, no-op) tabs. */
export function ShareDialog({
  open,
  onOpenChange,
  shared,
  shareSlug,
  onActivate,
  onStop,
}: ShareDialogProps) {
  const [tab, setTab] = useState<'link' | 'download'>('link');
  const url = `https://compendio.app/f/${shareSlug}`;

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title="Compartilhar ficha"
      size="sm"
      tabs={
        <PillTabs
          value={tab}
          onValueChange={setTab}
          options={[
            { value: 'link', label: 'Link público' },
            { value: 'download', label: 'Download' },
          ]}
        />
      }
    >
      {tab === 'link' ? (
        !shared ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-neutral-500">
              Ative para gerar um link somente leitura. Qualquer pessoa com o link poderá visualizar
              esta ficha, sem poder editá-la.
            </p>
            <Button onClick={onActivate}>Ativar compartilhamento</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2.5">
              <span className="flex-1 truncate text-xs text-neutral-400">{url}</span>
              <button
                type="button"
                className="shrink-0 text-xs font-semibold text-amber-500 hover:text-amber-400"
                onClick={() => navigator.clipboard?.writeText(url)}
              >
                Copiar
              </button>
            </div>
            <p className="text-[11px] text-neutral-600">
              Esse link continua ativo até você desativar o compartilhamento.
            </p>
            <button
              type="button"
              onClick={onStop}
              className="mt-1 flex items-center justify-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300"
            >
              <Circle className="h-3.5 w-3.5" strokeWidth={2} />
              Parar de compartilhar
            </button>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-neutral-500">
            Gere um arquivo PDF desta ficha para salvar ou imprimir.
          </p>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-neutral-800 py-2.5 text-sm font-medium text-neutral-200 transition hover:bg-neutral-700"
          >
            <Download className="h-4 w-4" strokeWidth={1.8} />
            Exportar em PDF
          </button>
        </div>
      )}
    </Popup>
  );
}
