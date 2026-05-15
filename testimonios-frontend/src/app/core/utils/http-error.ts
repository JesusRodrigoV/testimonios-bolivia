import { Observable, throwError } from 'rxjs';

export interface HttpError {
  status?: number;
  error?: { error?: string; message?: string };
  message?: string;
}

export function isHttpError(error: unknown): error is HttpError {
  return typeof error === 'object' && error !== null && 'status' in error;
}

export function extractErrorMessage(error: unknown, fallback = 'Ocurrió un error'): string {
  if (error instanceof Error) return error.message;
  if (error instanceof ErrorEvent) return error.message;
  if (error && typeof error === 'object') {
    const httpError = error as HttpError;
    return httpError.error?.error || httpError.error?.message || httpError.message || fallback;
  }
  return fallback;
}

export function handleHttpError(error: unknown, fallback = 'Ocurrió un error'): Observable<never> {
  return throwError(() => new Error(extractErrorMessage(error, fallback)));
}
