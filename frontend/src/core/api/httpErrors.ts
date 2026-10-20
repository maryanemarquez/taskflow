import { MESSAGES } from '../messages/messages';

export interface ApiFieldError {
  campo: string;
  codigo: string;
  mensagem: string;
}

export interface ApiProblem {
  codigo: string;
  detail?: string;
  erros?: ApiFieldError[];
}

export class ApiRequestError extends Error {
  readonly problem: ApiProblem;

  constructor(problem: ApiProblem) {
    super(problem.detail ?? MESSAGES.registration.genericError);
    this.problem = problem;
  }
}
