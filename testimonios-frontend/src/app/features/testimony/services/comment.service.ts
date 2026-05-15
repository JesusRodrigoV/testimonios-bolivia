import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, catchError } from 'rxjs';
import { handleHttpError } from '@app/core/utils/http-error';
import { environment } from 'src/environment/environment';
import { Comment } from '../models/comment.model';
import { AuthStore } from '@app/auth.store';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
private apiUrl = `${environment.apiUrl}/comments`;
  private http = inject(HttpClient);
  private authStore = inject(AuthStore);

  getComments(page: number = 1, limit: number = 20): Observable<{ data: Comment[], meta: { page: number, limit: number, total: number, totalPages: number } }> {
    return this.http.get<{ data: Comment[], meta: any }>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((comment) => ({
          ...comment,
          likeCount: comment.likes?.length || 0,
          isLiked: comment.likes?.some(
            like => like.id_usuario === this.authStore.user()?.id_usuario
          ) || false,
          replies: comment.replies || []
        }))
      }))
    );
  }

  getByTestimonioId(testimonyId: number, page: number = 1, limit: number = 10): Observable<{ data: Comment[], meta: { page: number, limit: number, total: number, totalPages: number } }> {
    return this.http.get<{ data: Comment[], meta: any }>(`${this.apiUrl}/testimonio/${testimonyId}?page=${page}&limit=${limit}`).pipe(
      map((response) => ({
        ...response,
        data: response.data.map((comment) => ({
          ...comment,
          likeCount: comment.likes?.length || 0,
          isLiked: comment.likes?.some(
            like => like.id_usuario === this.authStore.user()?.id_usuario
          ) || false,
          replies: comment.replies || []
        }))
      }))
    );
  }

  createComment(comment: { contenido: string; id_testimonio: number; parent_id?: number }): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment).pipe(
      map((comment) => ({
        ...comment,
        replies: comment.replies ?? [],
        likeCount: comment.likes?.length || 0,
        isLiked: comment.likes?.some(like => like.id_usuario === this.authStore.user()?.id_usuario) || false
      }))
    );
  }

  likeComment(commentId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${commentId}/like`, {});
  }

  unlikeComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}/like`);
  }

  getPendingComments(): Observable<Comment[]> {
    return this.processComments(
      this.http.get<Comment[]>(`${this.apiUrl}/pending`)
    );
  }

  updateComment(id: number, data: { contenido?: string; id_estado?: number }): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/${id}`, data).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al actualizar comentario")),
    );
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al eliminar comentario")),
    );
  }

  private processComments(comments$: Observable<Comment[]>): Observable<Comment[]> {
    return comments$.pipe(
      map(comments =>
        comments.map(comment => ({
          ...comment,
          likeCount: comment.likes?.length || 0,
          isLiked: comment.likes?.some(
            like => like.id_usuario === this.authStore.user()?.id_usuario
          ) || false,
          replies: comment.replies || []
        }))
      )
    );
  }
}
