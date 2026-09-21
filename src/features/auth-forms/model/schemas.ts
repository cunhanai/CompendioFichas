import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Digite um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
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
export type SignupValues = z.infer<typeof signupSchema>;
