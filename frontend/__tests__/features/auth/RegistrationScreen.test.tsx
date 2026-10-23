import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from 'expo-router';
import { authApi } from '../../../src/features/auth/api/authApi';
import { RegistrationScreen } from '../../../src/features/auth/ui/RegistrationScreen';
import { InitialWorkspaceScreen } from '../../../src/features/auth/ui/InitialWorkspaceScreen';
import { useSessionStore } from '../../../src/features/auth/model/sessionStore';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../../../src/features/auth/api/authApi', () => ({
  authApi: {
    register: jest.fn(),
    currentUser: jest.fn(),
  },
}));

const SESSION_TOKENS = {
  tipo: 'Bearer',
  accessToken: 'access-token',
  accessTokenExpiraEm: '2026-10-20T20:15:00Z',
  refreshToken: 'refresh-token',
  refreshTokenExpiraEm: '2026-10-27T20:00:00Z',
};

const CURRENT_USER = {
  usuario: { id: 1, nome: 'Ana', email: 'ana@taskflow.invalid' },
  workspace: { id: 2, nome: 'Workspace de Ana', papel: 'PROPRIETARIO' },
};

const renderRegistration = () => {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <RegistrationScreen />
    </QueryClientProvider>,
  );
};

const fillAndSubmit = (password: string) => {
  fireEvent.changeText(screen.getByLabelText('Nome'), 'Ana');
  fireEvent.changeText(screen.getByLabelText('E-mail'), 'ana@taskflow.invalid');
  fireEvent.changeText(screen.getByLabelText('Senha'), password);
  fireEvent.press(screen.getByRole('button', { name: 'Criar minha conta' }));
};

beforeEach(() => {
  jest.resetAllMocks();
  localStorage.clear();
  useSessionStore.setState({ tokens: null, currentUser: null });
  jest.mocked(authApi.register).mockResolvedValue(SESSION_TOKENS);
  jest.mocked(authApi.currentUser).mockResolvedValue(CURRENT_USER);
});

it('HIST-001-auth/C01 - cadastro válido envia somente nome, e-mail e senha', async () => {
  renderRegistration();

  fillAndSubmit('Senha1234');

  await waitFor(() =>
    expect(authApi.register).toHaveBeenCalledWith({
      nome: 'Ana',
      email: 'ana@taskflow.invalid',
      senha: 'Senha1234',
    }),
  );
});

it('HIST-001-auth/C02 - cadastro inicia sessão e exibe a tela inicial do workspace', async () => {
  renderRegistration();

  fillAndSubmit('Senha1234');

  await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/dashboard'));
  expect(useSessionStore.getState().tokens).toEqual(SESSION_TOKENS);
  expect(localStorage.getItem('taskflow-session')).toContain(SESSION_TOKENS.accessToken);
  render(<InitialWorkspaceScreen />);
  expect(screen.getByText('Olá, Ana')).toBeTruthy();
  expect(screen.getByText('Workspace de Ana')).toBeTruthy();
});

it('HIST-001-auth/C03 - senha válida com 72 bytes é enviada sem truncamento', async () => {
  const password = 'a1' + 'á'.repeat(35);
  expect(new TextEncoder().encode(password)).toHaveLength(72);
  renderRegistration();

  fillAndSubmit(password);

  await waitFor(() =>
    expect(authApi.register).toHaveBeenCalledWith(
      expect.objectContaining({ senha: password }),
    ),
  );
});

it('HIST-001-auth/C04 - senha com 73 bytes é rejeitada antes do envio', async () => {
  const password = 'a1' + 'á'.repeat(35) + 'a';
  expect(new TextEncoder().encode(password)).toHaveLength(73);
  renderRegistration();

  fillAndSubmit(password);

  expect(await screen.findByText('A senha é muito longa.')).toBeTruthy();
  expect(authApi.register).not.toHaveBeenCalled();
});
