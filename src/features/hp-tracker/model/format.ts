import type { DrItem } from '@/entities/character/model/types';

export function drLabel(dr: DrItem): string {
  return dr.immune ? `Imune a ${dr.type}` : `RD ${dr.type} ${dr.amount}`;
}

export function drTone(dr: DrItem): 'violet' | 'sky' {
  return dr.immune ? 'violet' : 'sky';
}
