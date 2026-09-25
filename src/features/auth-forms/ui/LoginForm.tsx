import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from '@/entities/session';
import { Button } from '@/shared/ui/atoms/Button';
import { TextField } from '@/shared/ui/atoms/TextField';
import { PasswordField } from '@/shared/ui/atoms/PasswordField';
import { useAppToast } from '@/shared/ui/organisms';
import { loginSchema, type LoginValues } from '../model/schemas';

export function LoginForm() {
  const { login } = useSession();
  const toast = useAppToast();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    const result = await login(values);
    if (result.ok) return;
    if (result.unexpected) {
      toast.error(result.error);
    } else {
      setFormError(result.error);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 backdrop-blur">
      <h2 className="font-display mb-5 text-lg text-neutral-100">Entrar</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Nome de usuário"
          type="text"
          autoComplete="username"
          placeholder="seu_usuario"
          startAdornment="@"
          error={errors.username?.message}
          {...register('username')}
        />
        <PasswordField
          label="Senha"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        {formError && <p className="text-xs text-rose-400">{formError}</p>}
        <Button type="submit" className="mt-2" disabled={isSubmitting}>
          Entrar
        </Button>
      </form>
    </div>
  );
}
