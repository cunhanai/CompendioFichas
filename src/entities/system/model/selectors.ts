import type { RpgSystem, SystemStatus } from './types';

/**
 * Um sistema é "ativo" se tiver ao menos 1 personagem ativo; caso contrário "inativo"
 * (ainda acessível, só um marcador de organização). "soon" vence os dois quando o sistema
 * não foi implementado nesta rodada.
 */
export function getSystemStatus(system: RpgSystem, hasActiveCharacter: boolean): SystemStatus {
  if (!system.implemented) return 'soon';
  return hasActiveCharacter ? 'active' : 'inactive';
}
