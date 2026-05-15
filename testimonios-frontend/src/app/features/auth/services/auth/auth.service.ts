import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import {
  LoginCredentials,
  AuthResponse,
  TwoFactorResponse,
  User,
} from "@app/features/auth/models/user.model";
import { Observable, catchError, tap, of } from "rxjs";
import { handleHttpError, isHttpError } from "@app/core/utils/http-error";
import { environment } from "src/environment/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/profile`).pipe(
      catchError((error: unknown) => {
        return handleHttpError(error, 'Error al obtener perfil de usuario');
      }),
    );
  }

  register(data: {
    email: string;
    password: string;
    nombre: string;
    biografia?: string;
  }): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/register`, data).pipe(
      catchError((error: unknown) => {
        return handleHttpError(error, 'Error al registrarse');
      }),
    );
  }

  login(
    credentials: LoginCredentials,
  ): Observable<AuthResponse | TwoFactorResponse> {
    return this.http
      .post<AuthResponse | TwoFactorResponse>(
        `${this.API_URL}/login`,
        credentials,
        { withCredentials: true },
      )
      .pipe(
        catchError((error: unknown) => {
          const status = isHttpError(error) ? error.status : undefined;
          if (status === 401) {
            return handleHttpError(error, 'Credenciales inválidas');
          }
          if (status === 0) {
            return handleHttpError(error, 'No se pudo conectar con el servidor. Verifica tu conexión o la disponibilidad del servidor.');
          }
          return handleHttpError(error, 'Error en el servidor');
        }),
      );
  }

  verify2FA(token: string, tempToken: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.API_URL}/verify-2fa`,
        { token },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        },
      )
      .pipe(
        catchError((error: unknown) => {
          return handleHttpError(error, 'Error en la verificación 2FA');
        }),
      );
  }

  setup2FA(
    secret: string,
    token: string,
    tempToken: string,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${this.API_URL}/verify-2fa`,
        { token },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        },
      )
      .pipe(
        catchError((error: unknown) => {
          return handleHttpError(error, 'Error en la configuración 2FA');
        }),
      );
  }

  logout(): Observable<void> {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      localStorage.removeItem('accessToken');
      this.router.navigate(['/login']);
      return of(void 0);
    }

    return this.http
      .post<void>(
        `${this.API_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      )
      .pipe(
        tap(() => {
          localStorage.removeItem('accessToken');
          this.router.navigate(['/login']);
        }),
        catchError((error) => {
          localStorage.removeItem('accessToken');
          this.router.navigate(['/login']);
          return of(void 0);
        }),
      );
  }

  refreshToken(): Observable<{ accessToken: string }> {
    return this.http
      .post<{ accessToken: string }>(
        `${this.API_URL}/refresh`,
        {},
        { withCredentials: true },
      )
      .pipe(
        tap((response) => {
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
          }
        }),
        catchError((error: unknown) => {
          localStorage.removeItem('accessToken');
          return handleHttpError(error, 'Error al refrescar token');
        }),
      );
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.API_URL}/forgot-password`, { email })
      .pipe(
        catchError((error: unknown) => {
          return handleHttpError(error, 'Error al solicitar reset');
        }),
      );
  }

  resetPassword(
    token: string,
    newPassword: string,
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.API_URL}/reset-password`, {
        token,
        newPassword,
      })
      .pipe(
        catchError((error: unknown) => {
          return handleHttpError(error, 'Error al resetear password');
        }),
      );
  }

  getUserInfo(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/user-info/${id}`);
  }
}
