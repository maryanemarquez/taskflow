import { MESSAGES } from '../../../core/messages/messages';
import type { RegistrationPayload } from './authTypes';

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 150;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LETTER_PATTERN = /\p{L}/u;
const NUMBER_PATTERN = /\d/;

export type RegistrationField = keyof RegistrationPayload;
export type RegistrationErrors = Partial<Record<RegistrationField, string>>;

export function validateRegistration(payload: RegistrationPayload): RegistrationErrors {
  const errors: RegistrationErrors = {};
  validateName(payload.nome, errors);
  validateEmail(payload.email, errors);
  validatePassword(payload.senha, errors);
  return errors;
}

function validateName(name: string, errors: RegistrationErrors) {
  const value = name.trim();
  if (!value) {
    errors.nome = MESSAGES.registration.required;
  } else if ([...value].length > MAX_NAME_LENGTH) {
    errors.nome = MESSAGES.registration.nameTooLong;
  }
}

function validateEmail(email: string, errors: RegistrationErrors) {
  const value = email.trim();
  if (!value) {
    errors.email = MESSAGES.registration.required;
  } else if ([...value].length > MAX_EMAIL_LENGTH) {
    errors.email = MESSAGES.registration.emailTooLong;
  } else if (!EMAIL_PATTERN.test(value)) {
    errors.email = MESSAGES.registration.invalidEmail;
  }
}

function validatePassword(password: string, errors: RegistrationErrors) {
  const length = [...password].length;
  if (!password) {
    errors.senha = MESSAGES.registration.required;
  } else if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    errors.senha = MESSAGES.registration.passwordTooLong;
  } else if (
    length < MIN_PASSWORD_LENGTH ||
    !LETTER_PATTERN.test(password) ||
    !NUMBER_PATTERN.test(password)
  ) {
    errors.senha = MESSAGES.registration.passwordPolicy;
  }
}
