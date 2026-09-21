import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UserProfile } from '@/entities/user/model/types';
import { SectionCard, SectionCardHeader } from '@/shared/ui/molecules/SectionCard';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { FieldView } from '@/shared/ui/molecules/FieldView';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';
import { accountSchema, type AccountValues } from '../model/schemas';

export interface AccountCardProps {
  user: UserProfile;
  onSave: (values: AccountValues) => void;
}

export function AccountCard({ user, onSave }: AccountCardProps) {
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit } = useForm<AccountValues>({
    resolver: zodResolver(accountSchema),
    values: { name: user.name, username: user.username, email: user.email },
  });

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
          <FieldView label="Nome de usuário" value={user.username} />
          <FieldView label="E-mail" value={user.email} />
          <FieldView label="Senha" value="••••••••" />
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
            <TextField label="Nome de usuário" {...register('username')} />
            <div className="sm:col-span-2">
              <TextField label="E-mail" type="email" {...register('email')} />
            </div>
          </div>
          <Button type="submit" className="mt-4 w-full">
            Salvar
          </Button>
        </form>
      )}
    </SectionCard>
  );
}
