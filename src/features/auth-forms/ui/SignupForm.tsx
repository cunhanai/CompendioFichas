import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from '@/entities/session';
import { useAppData } from '@/app/providers';
import { Button } from '@/shared/ui/atoms/Button';
import { TextField } from '@/shared/ui/atoms/TextField';
import { signupSchema, type SignupValues } from '../model/schemas';

export interface SignupFormProps {
  onGoLogin: () => void;
}

export function SignupForm({ onGoLogin }: SignupFormProps) {
  const { signup } = useSession();
  const { updateUser } = useAppData();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = (values: SignupValues) => {
    updateUser((u) => ({
      ...u,
      name: values.username,
      username: values.username,
      email: values.email,
    }));
    signup();
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 backdrop-blur">
      <h2 className="font-display mb-5 text-lg text-neutral-100">Criar conta</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Nome de usuário"
          type="text"
          placeholder="seu_usuario"
          error={errors.username?.message}
          {...register('username')}
        />
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
        <TextField
          label="Confirmar senha"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" className="mt-2" disabled={isSubmitting}>
          Criar conta
        </Button>
      </form>
      <p className="mt-5 text-center text-xs text-neutral-500">
        Já tem conta?{' '}
        <button
          type="button"
          onClick={onGoLogin}
          className="font-medium text-amber-400 hover:text-amber-300"
        >
          Entrar
        </button>
      </p>
    </div>
  );
}
