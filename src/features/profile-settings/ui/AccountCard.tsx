import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import type { UserProfile } from '@/entities/user/model/types';
import { SectionCard, SectionCardHeader } from '@/shared/ui/molecules/SectionCard';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { FieldView } from '@/shared/ui/molecules/FieldView';
import { TextField } from '@/shared/ui/atoms/TextField';
import { PasswordField } from '@/shared/ui/atoms/PasswordField';
import { Button } from '@/shared/ui/atoms/Button';
import { api, ApiError } from '@/shared/lib/api';
import { useAppToast } from '@/shared/ui/organisms';
import {
  accountSchema,
  passwordSchema,
  type AccountValues,
  type PasswordValues,
} from '../model/schemas';

export interface AccountCardProps {
  user: UserProfile;
  onSave: (values: AccountValues) => void;
}

export function AccountCard({ user, onSave }: AccountCardProps) {
  const toast = useAppToast();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { register, handleSubmit } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    values: { name: user.name, username: user.username },
  });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    setError: setPasswordError,
    formState: { errors: passwordErrors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const onSavePassword = async (values: PasswordValues) => {
    try {
      await api.patch('/user/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Senha alterada.');
      resetPassword();
      setChangingPassword(false);
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.status === 401) {
        setPasswordError('currentPassword', { message: apiErr.message });
      } else {
        toast.error(apiErr?.message ?? 'Não foi possível alterar a senha.');
      }
    }
  };

  return (
    <SectionCard className="mb-5">
      <SectionCardHeader
        title="Dados da conta"
        action={
          <EditToggleButton
            editing={editing}
            onToggle={() => setEditing((e) => !e)}
            label="Editar dados"
          />
        }
      />
      {!editing ? (
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <FieldView label="Nome" value={user.name} />
          <FieldView label="Nome de usuário" value={`@${user.username}`} />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit((values) => {
            onSave(values);
            setEditing(false);
          })}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Nome" {...register('name')} />
            <TextField label="Nome de usuário" startAdornment="@" {...register('username')} />
          </div>
          <Button type="submit" className="mt-4 w-full">
            Salvar
          </Button>
        </form>
      )}

      <div className="mt-4 border-t border-neutral-800 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-400">Senha</span>
          <button
            type="button"
            onClick={() => setChangingPassword((c) => !c)}
            className="flex items-center gap-1.5 text-xs font-medium text-amber-500 hover:text-amber-400"
          >
            <Lock className="h-3.5 w-3.5" strokeWidth={1.8} />
            Alterar senha
          </button>
        </div>
        {changingPassword && (
          <form
            onSubmit={handlePasswordSubmit(onSavePassword)}
            className="mt-3 flex flex-col gap-3"
          >
            <PasswordField
              label="Senha atual"
              error={passwordErrors.currentPassword?.message}
              {...registerPassword('currentPassword')}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <PasswordField
                label="Nova senha"
                error={passwordErrors.newPassword?.message}
                {...registerPassword('newPassword')}
              />
              <PasswordField
                label="Confirmar nova senha"
                error={passwordErrors.confirmPassword?.message}
                {...registerPassword('confirmPassword')}
              />
            </div>
            <Button type="submit" variant="secondary" className="mt-1">
              Salvar senha
            </Button>
          </form>
        )}
      </div>
    </SectionCard>
  );
}
