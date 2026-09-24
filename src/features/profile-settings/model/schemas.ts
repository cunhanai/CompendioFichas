import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(1, 'Informe um nome'),
  username: z.string().min(3, 'Escolha um nome de usuário com ao menos 3 caracteres'),
});
export type AccountValues = z.infer<typeof accountSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(6, 'A nova senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type PasswordValues = z.infer<typeof passwordSchema>;
