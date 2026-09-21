export type SystemStatus = 'active' | 'inactive' | 'soon';

export interface RpgSystem {
  id: string;
  title: string;
  /** Ativo = tem ao menos 1 personagem ativo. Inativo = organizacional, ainda acessível. Soon = não implementado nesta rodada. */
  status: SystemStatus;
  favorited: boolean;
  playerCount: number;
}
