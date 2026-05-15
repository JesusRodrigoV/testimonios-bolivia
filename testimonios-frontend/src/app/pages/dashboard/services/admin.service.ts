import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError } from "rxjs";
import { handleHttpError } from "@app/core/utils/http-error";
import { User } from "@app/features/auth/models/user.model";
import { environment } from "src/environment/environment";

export interface HistoricalEvent {
  id_evento?: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  is_active?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly EVENTS_URL = `${environment.apiUrl}/events`;
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`).pipe(
      catchError((error: unknown) => {
        return handleHttpError(error, "Error al obtener usuarios");
      }),
    );
  }

  createUser(userData: Partial<User>): Observable<User> {
    const { id_usuario, ...userWithoutId } = userData;
    return this.http.post<User>(`${this.API_URL}/users`, userWithoutId).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al crear usuario")),
    );
  }

  updateUser(id_usr: number, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/users/${id_usr}`, userData).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al actualizar usuario")),
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`).pipe(
      catchError((error: unknown) => {
        return handleHttpError(error, "Error al eliminar usuario");
      }),
    );
  }

  getEvents(): Observable<HistoricalEvent[]> {
    return this.http.get<HistoricalEvent[]>(`${this.EVENTS_URL}/admin`).pipe(
      catchError((error: unknown) => {
        return handleHttpError(error, "Error al obtener eventos");
      }),
    );
  }

  getEventById(id: number): Observable<HistoricalEvent> {
    return this.http.get<HistoricalEvent>(`${this.EVENTS_URL}/${id}`).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al obtener el evento")),
    );
  }

  createEvent(eventData: Partial<HistoricalEvent>): Observable<HistoricalEvent> {
    const { id_evento, ...data } = eventData;
    return this.http.post<HistoricalEvent>(this.EVENTS_URL, data).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al crear evento")),
    );
  }

  updateEvent(id: number, eventData: Partial<HistoricalEvent>): Observable<HistoricalEvent> {
    return this.http.put<HistoricalEvent>(`${this.EVENTS_URL}/${id}`, eventData).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al actualizar evento")),
    );
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.EVENTS_URL}/${id}`).pipe(
      catchError((error: unknown) => {
        return handleHttpError(error, "Error al eliminar evento");
      }),
    );
  }
}
