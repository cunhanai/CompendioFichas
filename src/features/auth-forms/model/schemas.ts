import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Digite seu nome de usuário'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});
export type LoginValues = z.infer<typeof loginSchema>;
