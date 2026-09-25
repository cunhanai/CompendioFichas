/** Centralized URL builders so every link/navigate call agrees on the app's real routes. */
export const routes = {
  dashboard: () => '/',
  systems: () => '/sistemas',
  characters: (systemId: string) => `/sistemas/${systemId}/personagens`,
  library: (systemId: string) => `/sistemas/${systemId}/biblioteca`,
  profile: () => '/perfil',
  adminCreateUser: () => '/perfil/criar-usuario',
  adminUsers: () => '/admin/usuarios',
  sheet: (characterId: string) => `/personagens/${characterId}`,
};
