import { z } from 'zod';

export const signupBodySchema = z.object({
  username: z.string().min(3, 'Escolha um nome de usuário com ao menos 3 caracteres'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

export const loginBodySchema = z.object({
  username: z.string().min(1, 'Digite seu nome de usuário'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

export const passwordChangeBodySchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: z.string().min(6, 'A nova senha deve ter ao menos 6 caracteres'),
});

const uuid = z.uuid();

export const spellItemSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  school: z.string(),
  circle: z.number().int().min(0),
  castTime: z.string(),
  range: z.string(),
  duration: z.string(),
  resistance: z.string(),
  desc: z.string(),
});

export const weaponItemSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  atk: z.string(),
  crit: z.string(),
  dmg: z.string(),
  type: z.string(),
  range: z.string(),
  desc: z.string(),
  hasAmmo: z.boolean(),
  ammoMax: z.number().int().min(0),
});

export const specialItemSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  subtitle: z.string(),
  uses: z.string(),
  desc: z.string(),
});

export const genericLibraryItemSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  desc: z.string(),
  tag: z.string(),
});
