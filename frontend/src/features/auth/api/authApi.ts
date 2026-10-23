import { httpClient } from '../../../core/api/httpClient';
import type {
  CurrentUserResponse,
  RegistrationPayload,
  SessionTokens,
} from '../model/authTypes';

const REGISTRATION_ENDPOINT = '/api/v1/auth/cadastro';
const CURRENT_USER_ENDPOINT = '/api/v1/auth/eu';

export const authApi = {
  async register(payload: RegistrationPayload): Promise<SessionTokens> {
    const response = await httpClient.post<SessionTokens>(REGISTRATION_ENDPOINT, payload);
    return response.data;
  },
  async currentUser(): Promise<CurrentUserResponse> {
    const response = await httpClient.get<CurrentUserResponse>(CURRENT_USER_ENDPOINT);
    return response.data;
  },
};
