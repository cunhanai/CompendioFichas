export type SystemStatus = 'active' | 'inactive' | 'soon';

export interface RpgSystem {
  id: string;
  title: string;
  /** false = "em breve" neste compêndio (navegação decorativa, sem personagens/biblioteca reais). */
  implemented: boolean;
  favorited: boolean;
  playerCount: number;
  /** Logo oficial do sistema, se houver. Sem ela, o card cai no ícone de placeholder. */
  logoUrl?: string;
}
