export interface RegistrationPayload {
  nome: string;
  email: string;
  senha: string;
}

export interface SessionTokens {
  tipo: string;
  accessToken: string;
  accessTokenExpiraEm: string;
  refreshToken: string;
  refreshTokenExpiraEm: string;
}

export interface CurrentUserResponse {
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
  workspace: {
    id: number;
    nome: string;
    papel: string;
  } | null;
}
