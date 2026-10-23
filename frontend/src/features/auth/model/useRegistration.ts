import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ApiRequestError } from '../../../core/api/httpErrors';
import { MESSAGES } from '../../../core/messages/messages';
import { authApi } from '../api/authApi';
import type { RegistrationPayload } from './authTypes';
import { AUTH_QUERY_KEYS } from './authQueries';
import { useSessionStore } from './sessionStore';
import { validateRegistration, type RegistrationErrors, type RegistrationField } from './registrationValidation';

const EMPTY_FORM: RegistrationPayload = { nome: '', email: '', senha: '' };
const WORKSPACE_ROUTE = '/dashboard';

export function useRegistration() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: RegistrationPayload) => completeRegistration(payload, queryClient),
  });

  const updateField = (field: RegistrationField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = () => {
    const validationErrors = validateRegistration(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      mutation.mutate({ ...form, nome: form.nome.trim(), email: form.email.trim().toLowerCase() });
    }
  };

  const errorMessage = getErrorMessage(mutation.error);
  return { form, errors, updateField, submit, isSubmitting: mutation.isPending, errorMessage };
}

async function completeRegistration(
  payload: RegistrationPayload,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  const tokens = await authApi.register(payload);
  useSessionStore.getState().setTokens(tokens);
  try {
    const currentUser = await queryClient.fetchQuery({
      queryKey: AUTH_QUERY_KEYS.currentUser,
      queryFn: authApi.currentUser,
      retry: false,
    });
    useSessionStore.getState().setCurrentUser(currentUser);
  } catch (error) {
    useSessionStore.getState().clear();
    throw error;
  }
  router.replace(WORKSPACE_ROUTE);
}

function getErrorMessage(error: Error | null) {
  if (!error) {
    return null;
  }
  return error instanceof ApiRequestError ? error.message : MESSAGES.registration.genericError;
}
