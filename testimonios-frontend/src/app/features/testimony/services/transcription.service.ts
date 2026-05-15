import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NotificationService } from '@app/core/services/notification.service';
import { Observable, map, catchError } from 'rxjs';
import { handleHttpError, isHttpError } from '@app/core/utils/http-error';
import { environment } from 'src/environment/environment';
import { Transcripcion, TranscripcionResponse } from '../models/transcription.model';

@Injectable({
  providedIn: 'root'
})
export class TranscriptionService {
  private readonly http = inject(HttpClient);
  private readonly notification = inject(NotificationService);
  private readonly apiUrl = `${environment.apiUrl}/transcription`;

  transcribirArchivo(testimonioId: number): Observable<Transcripcion> {
    return this.http
      .post<TranscripcionResponse>(
        `${this.apiUrl}/${testimonioId}/transcribir`,
        {},
      )
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error('Error al solicitar transcripción');
          }
          return response.data as Transcripcion;
        }),
        catchError((error: unknown) => {
          const status = isHttpError(error) ? error.status : undefined;
          const message =
            status === 403
              ? 'No tienes permiso para transcribir este testimonio'
              : status === 404
                ? 'Testimonio no encontrado'
                : status === 401
                  ? 'Usuario no autenticado'
                  : 'Error al procesar la transcripción';
          this.notification.error(message);
          return handleHttpError(error, message);
        })
      );
  }

  obtenerTranscripcion(id: number): Observable<Transcripcion> {
    return this.http
      .get<TranscripcionResponse>(`${this.apiUrl}/transcripciones/${id}`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error('Error al obtener transcripción');
          }
          return response.data as Transcripcion;
        }),
        catchError((error: unknown) => {
          const status = isHttpError(error) ? error.status : undefined;
          const message =
            status === 404
              ? 'Transcripción no encontrada'
              : status === 401
                ? 'Usuario no autenticado'
                : 'Error al obtener la transcripción';
          this.notification.error(message);
          return handleHttpError(error, message);
        })
      );
  }

  obtenerTranscripcionesPorTestimonio(testimonioId: number): Observable<Transcripcion[]> {
    return this.http
      .get<TranscripcionResponse>(`${this.apiUrl}/${testimonioId}/transcripciones`)
      .pipe(
        map((response) => {
          if (!response.success) {
            throw new Error('Error al obtener transcripciones');
          }
          return response.data as Transcripcion[];
        }),
        catchError((error: unknown) => {
          const status = isHttpError(error) ? error.status : undefined;
          const message =
            status === 401
              ? 'Usuario no autenticado'
              : 'Error al obtener las transcripciones';
          this.notification.error(message);
          return handleHttpError(error, message);
        })
      );
  }
}
