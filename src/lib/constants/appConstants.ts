export const APP_ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  clients: "/clients",
  documents: "/documents",
  meetings: "/meetings",
  proposals: "/proposals",
  legal: "/legal",
  finance: "/finance",
  knowledge: "/knowledge",
  intelligence: "/intelligence",
  projects: "/projects",
  users: "/users",
  settings: "/settings",
  contracts: "/contracts",
} as const;

export const STORAGE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
} as const;
