import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthStore } from '@app/auth.store';
import { Observable, catchError, map, of } from 'rxjs';
import { handleHttpError } from '@app/core/utils/http-error';
import { environment } from 'src/environment/environment';
import { Calificacion } from '../models/calification.model';
import { Testimony } from '../models/testimonio.model';

@Injectable({
  providedIn: 'root'
})
export class CalificationService {
  private readonly apiUrl = `${environment.apiUrl}/score`;
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);

  getAll(): Observable<Calificacion[]> {
    return this.http.get<Calificacion[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  getById(id: number): Observable<Calificacion> {
    return this.http.get<Calificacion>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al obtener calificación")),
    );
  }

  private normalizeTestimony(testimony: Testimony): Testimony {
    return {
      ...testimony,
      categories: testimony.categories ?? [],
      tags: testimony.tags ?? [],
    };
  }

  getTopRatedTestimonies(limit: number = 5): Observable<Testimony[]> {
    const params = new HttpParams().set("limit", limit.toString());
    return this.http.get<Testimony[]>(`${this.apiUrl}/top-rated`, { params }).pipe(
      map((testimonies) => testimonies.map(this.normalizeTestimony)),
      catchError((error: unknown) => handleHttpError(error, "Error al obtener testimonios destacados")),
    );
  }

  getUserRatingForTestimony(testimonyId: number): Observable<Calificacion | null> {
    if (!this.authStore.isAuthenticated()) {
      return of(null);
    }
    return this.http.get<Calificacion>(`${this.apiUrl}/user-rating/${testimonyId}`).pipe(
      catchError(() => of(null))
    );
  }

  create(rating: { puntuacion: number, id_testimonio: number }): Observable<Calificacion> {
    if (!this.authStore.isAuthenticated()) {
      throw new Error('Usuario no autenticado');
    }
    if (rating.puntuacion < 1 || rating.puntuacion > 5) {
      throw new Error('La puntuación debe estar entre 1 y 5');
    }
    const payload = {
      puntuacion: rating.puntuacion,
      fecha: new Date().toISOString(),
      id_testimonio: rating.id_testimonio
    };
    return this.http.post<Calificacion>(this.apiUrl, payload).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al crear calificación")),
    );
  }

  update(id: number, rating: Partial<{ puntuacion: number, fecha: string, id_testimonio: number }>): Observable<Calificacion> {
    if (!this.authStore.isAuthenticated()) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.put<Calificacion>(`${this.apiUrl}/${id}`, rating).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al actualizar calificación")),
    );
  }

  delete(id: number): Observable<void> {
    if (!this.authStore.isAuthenticated()) {
      throw new Error('Usuario no autenticado');
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al eliminar calificación")),
    );
  }
}
