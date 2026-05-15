import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '@app/auth.store';
import { FavoritesStore } from '@app/stores/favorites.store';
import { AuthService } from '../features/auth/services/auth';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { NotificationService } from '@app/core/services/notification.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

type AuthStoreType = {
  accessToken: () => string | null;
  logout: () => void;
  setAccessToken: (token: string) => void;
};

type FavoritesStoreType = {
  reset: () => void;
};

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authStore = inject(AuthStore) as AuthStoreType;
  const favoritesStore = inject(FavoritesStore);
  const authService = inject(AuthService);
  const notification = inject(NotificationService);

  const token = authStore.accessToken();

  // Evitar añadir Authorization en /refresh
  const authReq =
    token && !req.url.includes('/refresh')
      ? req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        })
      : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401 && token && !req.url.includes('/refresh')) {
        return handle401Error(req, next, authStore, favoritesStore, authService, notification);
      }
      return throwError(() => error);
    }),
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authStore: AuthStoreType,
  favoritesStore: FavoritesStoreType,
  authService: AuthService,
  notification: NotificationService,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: { accessToken: string }) => {
        isRefreshing = false;
        refreshTokenSubject.next(response.accessToken);
        authStore.setAccessToken(response.accessToken);
        localStorage.setItem('accessToken', response.accessToken);

        const retryReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${response.accessToken}`),
        });
        return next(retryReq);
      }),
      catchError((err) => {
        isRefreshing = false;
        favoritesStore.reset();
        authStore.logout();
        notification.error(
          'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
          'Cerrar',
          { duration: 5000 },
        );
        return throwError(() => err);
      }),
    );
  }

  return refreshTokenSubject.pipe(
    filter((token) => token !== null),
    take(1),
    switchMap((token) =>
      next(
        req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`),
        }),
      ),
    ),
  );
}