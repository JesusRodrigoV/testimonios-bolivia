import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import {
  MapPoint,
  Testimony,
  TestimonyInput,
  TestimonyVersion,
} from "@app/features/testimony/models/testimonio.model";
import { catchError, map, Observable, of } from "rxjs";
import { handleHttpError } from "@app/core/utils/http-error";
import { environment } from "src/environment/environment";

@Injectable({
  providedIn: "root",
})
export class TestimonioService {
  private apiUrl = `${environment.apiUrl}`;
  private mediaUrl = this.apiUrl + "/media";

  private http = inject(HttpClient);

  private normalizeTestimony(testimony: Testimony): Testimony {
    return {
      ...testimony,
      categories: testimony.categories ?? [],
      tags: testimony.tags ?? [],
    };
  }

  getTestimonyCount(): Observable<number> {
    return this.http.get<number>(`${this.mediaUrl}/count`).pipe(
      catchError((error) => {
        return of(0);
      }),
    );
  }

  createTestimony(data: TestimonyInput): Observable<Testimony> {
    return this.http.post<Testimony>(this.mediaUrl, data).pipe(
      map(this.normalizeTestimony),
      catchError((error: unknown) => handleHttpError(error, "Error al crear testimonio")),
    );
  }

  getTestimony(id: number): Observable<Testimony> {
    return this.http.get<Testimony>(`${this.mediaUrl}/${id}`).pipe(
      map(this.normalizeTestimony),
      catchError((error: unknown) => handleHttpError(error, "Testimonio no encontrado")),
    );
  }

  getAll(): Observable<Testimony[]> {
    return this.http
      .get<{
        data: Testimony[];
        pagination: { total: number; cursor: string | null; hasMore: boolean };
      }>(this.mediaUrl)
      .pipe(
        map((response) => response.data.map(this.normalizeTestimony)),
        catchError((error: unknown) => handleHttpError(error, "Error al obtener testimonios")),
      );
  }

  getMyTestimonies(): Observable<Testimony[]> {
    return this.http.get<Testimony[]>(`${this.mediaUrl}/my-uploads`).pipe(
      map((testimonies) => testimonies.map(this.normalizeTestimony)),
      catchError((error: unknown) => handleHttpError(error, "Error al obtener tus testimonios")),
    );
  }

  searchTestimonies(params: {
    keyword?: string;
    dateFrom?: string;
    dateTo?: string;
    authorId?: number;
    category?: string;
    tag?: string;
    eventId?: number;
    page?: number;
    limit?: number;
    highlighted?: boolean;
    status?: string;
    cursor?: string | null;
  }): Observable<{
    data: Testimony[];
    pagination: { total: number; cursor: string | null; hasMore: boolean };
  }> {
    let httpParams = new HttpParams();
    if (params.keyword) httpParams = httpParams.set("keyword", params.keyword);
    if (params.dateFrom)
      httpParams = httpParams.set("dateFrom", params.dateFrom);
    if (params.dateTo) httpParams = httpParams.set("dateTo", params.dateTo);
    if (params.authorId)
      httpParams = httpParams.set("authorId", params.authorId.toString());
    if (params.category)
      httpParams = httpParams.set("category", params.category);
    if (params.tag) httpParams = httpParams.set("tag", params.tag);
    if (params.eventId)
      httpParams = httpParams.set("eventId", params.eventId.toString());
    if (params.page)
      httpParams = httpParams.set("page", params.page.toString());
    if (params.limit)
      httpParams = httpParams.set("limit", params.limit.toString());
    if (params.highlighted)
      httpParams = httpParams.set("highlighted", params.highlighted.toString());
    if (params.status)
      httpParams = httpParams.set("status", params.status);

    return this.http
      .get<{
        data: Testimony[];
        pagination: { total: number; cursor: string | null; hasMore: boolean };
      }>(this.mediaUrl, { params: httpParams })
      .pipe(
        map((response) => ({
          ...response,
          data: response.data.map(this.normalizeTestimony),
        })),
        catchError((error: unknown) => handleHttpError(error, "Error en la búsqueda")),
      );
  }

  validateTestimony(
    testimonyId: number,
    approve: boolean,
  ): Observable<{ id: number; status: string }> {
    return this.http
      .post<{
        id: number;
        status: string;
      }>(`${this.mediaUrl}/validate`, { testimonyId, approve })
      .pipe(
        catchError((error: unknown) => handleHttpError(error, "Error al validar testimonio")),
      );
  }

  getTestimonyVersions(id: number): Observable<TestimonyVersion[]> {
    return this.http
      .get<TestimonyVersion[]>(`${this.mediaUrl}/${id}/versions`)
      .pipe(
        catchError((error: unknown) => handleHttpError(error, "Error al obtener versiones")),
      );
  }

  getTestimonyMap(): Observable<MapPoint[]> {
    return this.http.get<MapPoint[]>(`${this.mediaUrl}/map/data`).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al obtener datos del mapa")),
    );
  }

  updateTestimony(id: number, data: Partial<Testimony>): Observable<Testimony> {
    return this.http.patch<Testimony>(`${this.mediaUrl}/${id}`, data).pipe(
      map(this.normalizeTestimony),
      catchError((error: unknown) => handleHttpError(error, "Error al actualizar testimonio")),
    );
  }

  deleteTestimony(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.mediaUrl}/${id}`).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al eliminar testimonio")),
    );
  }

  getAllCategories(): Observable<
    { id_categoria: number; nombre: string; descripcion: string }[]
  > {
    return this.http
      .get<
        { id_categoria: number; nombre: string; descripcion: string }[]
      >(`${environment.apiUrl}/categories`)
      .pipe(
        catchError((error: unknown) => handleHttpError(error, "Error al obtener categorías")),
      );
  }

  getAllTags(): Observable<{ id: number; name: string }[]> {
    return this.http
      .get<{ id: number; name: string }[]>(`${environment.apiUrl}/tags`)
      .pipe(
        catchError((error: unknown) => handleHttpError(error, "Error al obtener etiquetas")),
      );
  }

  getAllEvents(): Observable<
    { id: number; name: string; description: string; date: string }[]
  > {
    return this.http
      .get<
        { id: number; name: string; description: string; date: string }[]
      >(`${environment.apiUrl}/events`)
      .pipe(
        catchError((error: unknown) => handleHttpError(error, "Error al obtener eventos")),
      );
  }

  downloadTestimony(testimonyId: number): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.mediaUrl}/${testimonyId}/download`).pipe(
      catchError((error: unknown) => handleHttpError(error, "Error al obtener URL de descarga")),
    );
  }
}
