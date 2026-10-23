import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { authApi } from '../../../src/features/auth/api/authApi';
import { LoginScreen } from '../../../src/features/auth/ui/LoginScreen';
import { useSessionStore } from '../../../src/features/auth/model/sessionStore';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../../../src/features/auth/api/authApi', () => ({
  authApi: {
    login: jest.fn(),
    currentUser: jest.fn(),
  },
}));

const TOKENS = {
  tipo: 'Bearer',
  accessToken: 'token-acesso-teste',
  accessTokenExpiraEm: '2026-10-20T20:15:00Z',
  refreshToken: 'token-refresh-teste',
  refreshTokenExpiraEm: '2026-10-27T20:00:00Z',
};

const USUARIO_COM_WORKSPACE = {
  usuario: { id: 1, nome: 'Ana', email: 'ana@taskflow.invalid' },
  workspace: { id: 2, nome: 'Workspace de Ana', papel: 'PROPRIETARIO' },
};

const preencherLogin = () => {
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@taskflow.invalid');
  fireEvent.changeText(screen.getByLabelText('Senha'), 'Senha1234');
  fireEvent.press(screen.getByRole('button', { name: 'Entrar' }));
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  useSessionStore.setState({ tokens: null });
});

it('HIST-002-auth/C01 - login válido inicia sessão e abre área do workspace', async () => {
  jest.mocked(authApi.login).mockResolvedValue(TOKENS);
  jest.mocked(authApi.currentUser).mockResolvedValue(USUARIO_COM_WORKSPACE);
  render(<LoginScreen />);

  preencherLogin();

  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/dashboard'));
  expect(useSessionStore.getState().tokens).toEqual(TOKENS);
});

it('HIST-002-auth/C02 - login sem workspace abre somente a tela Sem Workspace', async () => {
  jest.mocked(authApi.login).mockResolvedValue(TOKENS);
  jest.mocked(authApi.currentUser).mockResolvedValue({
    ...USUARIO_COM_WORKSPACE,
    workspace: null,
  });
  render(<LoginScreen />);

  preencherLogin();

  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/sem-workspace'));
});

it.each([
  ['HIST-002-auth/C03', 'senha incorreta'],
  ['HIST-002-auth/C04', 'e-mail inexistente'],
])('%s - %s exibe a mensagem genérica de credenciais inválidas', async () => {
  jest.mocked(authApi.login).mockRejectedValue({
    codigo: 'CREDENCIAIS_INVALIDAS',
  });
  render(<LoginScreen />);

  preencherLogin();

  expect(await screen.findByText('E-mail ou senha inválidos.')).toBeTruthy();
  expect(router.replace).not.toHaveBeenCalled();
});
