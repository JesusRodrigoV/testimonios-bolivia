import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { Notificacion } from '../model/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  private http = inject(HttpClient);

  getAll(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.apiUrl);
  }

  getUnread(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/unread`);
  }

  getById(id: number): Observable<Notificacion> {
    return this.http.get<Notificacion>(`${this.apiUrl}/${id}`);
  }

  marcarComoLeido(id: number): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.apiUrl}/${id}/leer`, {});
  }

  cambiarEstado(id: number, id_estado: number): Observable<Notificacion> {
    return this.http.put<Notificacion>(`${this.apiUrl}/${id}/estado`, { id_estado });
  }

  marcarTodasComoLeidas(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
