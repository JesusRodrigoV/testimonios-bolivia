import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environment/environment';
import { ForoTema, ForoComentario, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private apiUrl = `${environment.apiUrl}/forumtopics`;
  private commentsApiUrl = `${environment.apiUrl}/forumcomments`;
  private eventsApiUrl = `${environment.apiUrl}/events`;

  private http = inject(HttpClient);

  getAllTopics(page = 1, limit = 20): Observable<PaginatedResponse<ForoTema>> {
    return this.http.get<PaginatedResponse<ForoTema>>(this.apiUrl, { params: { page, limit } })
      .pipe(catchError(this.handleError));
  }

  getMyTopics(page = 1, limit = 20): Observable<PaginatedResponse<ForoTema>> {
    return this.http.get<PaginatedResponse<ForoTema>>(`${this.apiUrl}/mytopics`, { params: { page, limit } })
      .pipe(catchError(this.handleError));
  }

  getTopicById(id: number): Observable<ForoTema> {
    return this.http.get<ForoTema>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTopic(data: {
    titulo: string;
    descripcion: string;
    id_evento?: number;
    id_testimonio?: number;
  }): Observable<ForoTema> {
    return this.http.post<ForoTema>(this.apiUrl, data)
      .pipe(catchError(this.handleError));
  }

  updateTopic(
    id: number,
    data: {
      titulo?: string;
      descripcion?: string;
      id_evento?: number;
      id_testimonio?: number;
    }
  ): Observable<ForoTema> {
    return this.http.put<ForoTema>(`${this.apiUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  deleteTopic(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getCommentsByTopicId(temaId: number, page = 1, limit = 10, sort: 'newest' | 'oldest' = 'newest'): Observable<PaginatedResponse<ForoComentario>> {
    return this.http.get<PaginatedResponse<ForoComentario>>(`${this.commentsApiUrl}/tema/${temaId}`, { params: { page, limit, sort } })
      .pipe(catchError(this.handleError));
  }

  getCommentById(id: number): Observable<ForoComentario> {
    return this.http.get<ForoComentario>(`${this.commentsApiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createComment(data: {
    contenido: string;
    id_forotema: number;
    parent_id?: number;
  }): Observable<ForoComentario> {
    return this.http.post<ForoComentario>(this.commentsApiUrl, data)
      .pipe(catchError(this.handleError));
  }

  updateComment(id: number, data: { contenido: string }): Observable<ForoComentario> {
    return this.http.put<ForoComentario>(`${this.commentsApiUrl}/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.commentsApiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  getEvents(): Observable<{ id: number; name: string; description: string; date: string }[]> {
    return this.http.get<{ id: number; name: string; description: string; date: string }[]>(this.eventsApiUrl)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: unknown): Observable<never> {
    let errorMessage = 'Ocurrió un error';
    if (error instanceof ErrorEvent) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'error' in error) {
      const httpError = error as { status?: number; error?: { error?: string } };
      errorMessage = httpError.error?.error || `Error ${httpError.status ?? 'desconocido'}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
