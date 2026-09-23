import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { api, ApiError } from '@/shared/lib/api';
import { SectionCard, SectionCardHeader } from '@/shared/ui/molecules/SectionCard';
import { TextField } from '@/shared/ui/atoms/TextField';
import { PasswordField } from '@/shared/ui/atoms/PasswordField';
import { Button } from '@/shared/ui/atoms/Button';
import { useAppToast } from '@/shared/ui/organisms';
import { createUserSchema, type CreateUserValues } from '../model/schemas';

/** Status codes /auth/signup uses for something the admin can fix by editing the form. */
const EXPECTED_STATUSES = [400, 403, 409];

/** Admin-only: creates a new account without touching the admin's own session. */
export function CreateUserForm() {
  const toast = useAppToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({ resolver: zodResolver(createUserSchema) });

  const onSubmit = async ({ username, email, password }: CreateUserValues) => {
    setFormError(null);
    try {
      await api.post('/auth/signup', { username, email, password });
      toast.success(`Usuário "${username}" criado.`);
      reset();
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      const message = apiErr?.message ?? 'Não foi possível criar o usuário.';
      if (apiErr?.status && EXPECTED_STATUSES.includes(apiErr.status)) {
        setFormError(message);
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <SectionCard className="mb-5">
      <SectionCardHeader
        title="Criar usuário"
        action={<UserPlus className="h-4 w-4 text-neutral-500" strokeWidth={1.8} />}
      />
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Nome de usuário"
          placeholder="novo_usuario"
          error={errors.username?.message}
          {...register('username')}
        />
        <TextField
          label="E-mail"
          type="email"
          placeholder="pessoa@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PasswordField
            label="Senha"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordField
            label="Confirmar senha"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
        {formError && <p className="text-xs text-rose-400">{formError}</p>}
        <Button type="submit" className="mt-1" disabled={isSubmitting}>
          Criar usuário
        </Button>
      </form>
    </SectionCard>
  );
}
