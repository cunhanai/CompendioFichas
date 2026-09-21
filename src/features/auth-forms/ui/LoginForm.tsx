import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from '@/entities/session';
import { Button } from '@/shared/ui/atoms/Button';
import { TextField } from '@/shared/ui/atoms/TextField';
import { loginSchema, type LoginValues } from '../model/schemas';

export interface LoginFormProps {
  onGoSignup: () => void;
}

export function LoginForm({ onGoSignup }: LoginFormProps) {
  const { login } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 backdrop-blur">
      <h2 className="font-display mb-5 text-lg text-neutral-100">Entrar</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(() => login())}>
        <TextField
          label="E-mail"
          type="email"
          placeholder="voce@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Senha"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" className="mt-2" disabled={isSubmitting}>
          Entrar
        </Button>
      </form>
      <p className="mt-5 text-center text-xs text-neutral-500">
        Não tem conta?{' '}
        <button
          type="button"
          onClick={onGoSignup}
          className="font-medium text-amber-400 hover:text-amber-300"
        >
          Criar conta
        </button>
      </p>
    </div>
  );
}
