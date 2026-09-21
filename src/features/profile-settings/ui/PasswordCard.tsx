import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { SectionCard } from '@/shared/ui/molecules/SectionCard';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';
import { passwordSchema, type PasswordValues } from '../model/schemas';

export function PasswordCard() {
  const [editing, setEditing] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  return (
    <SectionCard>
      <h2 className="mb-4 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
        Senha
      </h2>
      {!editing ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-2 text-sm font-medium text-amber-500 hover:text-amber-400"
        >
          <Lock className="h-4 w-4" strokeWidth={1.8} />
          Alterar senha
        </button>
      ) : (
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit(() => {
            reset();
            setEditing(false);
          })}
        >
          <TextField
            label="Senha atual"
            type="password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <TextField
            label="Nova senha"
            type="password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <TextField
            label="Confirmar nova senha"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <div className="mt-1 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setEditing(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar senha
            </Button>
          </div>
        </form>
      )}
    </SectionCard>
  );
}
