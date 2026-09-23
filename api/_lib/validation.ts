import { z } from 'zod';

export const signupBodySchema = z.object({
  username: z.string().min(3, 'Escolha um nome de usuário com ao menos 3 caracteres'),
  email: z.email('Digite um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

export const loginBodySchema = z.object({
  email: z.email('Digite um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});
