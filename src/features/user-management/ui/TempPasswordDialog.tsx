import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { Button } from '@/shared/ui/atoms/Button';

export interface TempPasswordResult {
  username: string;
  password: string;
}

export interface TempPasswordDialogProps {
  result: TempPasswordResult | null;
  onClose: () => void;
}

/** Shows a just-generated temporary password once — it isn't stored anywhere after this. */
export function TempPasswordDialog({ result, onClose }: TempPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Popup
      open={result !== null}
      onOpenChange={(open) => !open && onClose()}
      title="Senha temporária gerada"
      subtitle={result ? `Para @${result.username}` : undefined}
      size="sm"
    >
      <p className="text-xs text-neutral-400">
        Repasse essa senha com segurança. Ela só aparece aqui uma vez — se sair desta tela, não dá
        para recuperá-la de novo (é só gerar outra). A conta foi desconectada de todos os
        dispositivos e deve trocar essa senha no próximo acesso.
      </p>
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5">
        <code className="flex-1 font-mono text-sm break-all text-amber-300">
          {result?.password}
        </code>
        <Button type="button" variant="secondary" size="sm" onClick={copy}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
    </Popup>
  );
}
