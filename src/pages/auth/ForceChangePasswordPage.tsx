import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from '@/entities/session';
import { api, ApiError } from '@/shared/lib/api';
import { useAppToast } from '@/shared/ui/organisms';
import { Button } from '@/shared/ui/atoms/Button';
import { PasswordField } from '@/shared/ui/atoms/PasswordField';
import { passwordSchema, type PasswordValues } from '@/features/profile-settings/model/schemas';
import { AuthLayout } from './AuthLayout';

export interface ForceChangePasswordPageProps {
  /** Called once the password was changed successfully, so the app can drop this gate. */
  onChanged: () => void;
}

/** Mandatory gate shown instead of the app when an admin reset this account's password. */
export function ForceChangePasswordPage({ onChanged }: ForceChangePasswordPageProps) {
  const { logout } = useSession();
  const toast = useAppToast();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit = async (values: PasswordValues) => {
    try {
      await api.patch('/user/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Senha alterada.');
      onChanged();
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.status === 401) {
        setError('currentPassword', { message: apiErr.message });
      } else {
        toast.error(apiErr?.message ?? 'Não foi possível alterar a senha.');
      }
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6 backdrop-blur">
        <h2 className="font-display mb-2 text-lg text-neutral-100">Troque sua senha</h2>
        <p className="mb-5 text-xs text-neutral-500">
          Sua senha foi redefinida por um administrador. Escolha uma nova senha para continuar.
        </p>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <PasswordField
            label="Senha temporária atual"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <PasswordField
            label="Nova senha"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <PasswordField
            label="Confirmar nova senha"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="mt-2" disabled={isSubmitting}>
            Salvar e continuar
          </Button>
        </form>
        <button
          type="button"
          onClick={logout}
          className="mt-4 w-full text-center text-xs text-neutral-500 hover:text-neutral-300"
        >
          Sair
        </button>
      </div>
    </AuthLayout>
  );
}
