import { z } from 'zod';

export const createUserSchema = z
  .object({
    username: z.string().min(3, 'Escolha um nome de usuário com ao menos 3 caracteres'),
    email: z.email('Digite um e-mail válido'),
    password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
export type CreateUserValues = z.infer<typeof createUserSchema>;
