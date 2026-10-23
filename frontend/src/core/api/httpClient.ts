import axios from 'axios';
import { ApiRequestError, type ApiProblem } from './httpErrors';
import { useSessionStore } from '../../features/auth/model/sessionStore';
import { MESSAGES } from '../messages/messages';

const AUTHORIZATION_HEADER = 'Authorization';
const BEARER_PREFIX = 'Bearer ';

export const httpClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = useSessionStore.getState().tokens?.accessToken;
  if (token) {
    config.headers.set(AUTHORIZATION_HEADER, `${BEARER_PREFIX}${token}`);
  }
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<ApiProblem>(error) && error.response?.data) {
      return Promise.reject(new ApiRequestError(error.response.data));
    }
    return Promise.reject(error ?? new Error(MESSAGES.registration.genericError));
  },
);
