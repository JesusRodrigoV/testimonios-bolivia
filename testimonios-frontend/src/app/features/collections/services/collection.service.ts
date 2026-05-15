import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "src/environment/environment";
import { Collection } from "../models/collection.model";
import { map, Observable, switchMap } from "rxjs";
import { Testimony } from "@app/features/testimony/models/testimonio.model";

@Injectable({
  providedIn: "root",
})
export class CollectionService {
  private apiUrl = `${environment.apiUrl}/collections`;

  private http = inject(HttpClient);

  getAll(): Observable<Collection[]> {
    return this.http.get<Collection[]>(this.apiUrl);
  }

  getById(id: number): Observable<Collection> {
    return this.http.get<Collection>(`${this.apiUrl}/${id}`);
  }

  create(collection: Partial<Collection>): Observable<Collection> {
    return this.http.post<Collection>(this.apiUrl, collection);
  }

  update(id: number, collection: Partial<Collection>): Observable<Collection> {
    return this.http.put<Collection>(`${this.apiUrl}/${id}`, collection);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getFavoritesCollectionId(): Observable<number> {
    return this.http
      .get<{ id_coleccion: number }>(`${this.apiUrl}/favorites-id`)
      .pipe(map((response) => response.id_coleccion));
  }

  getFavoriteCount(id: number): Observable<number> {
    return this.http
      .get<{ count: number }>(`${this.apiUrl}/favorite-count/${id}`)
      .pipe(map((response) => response.count));
  }

  getFavorites(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/favorites/ids`);
  }

  /**
   * @deprecated Usar toggleFavoriteDirect en su lugar.
   * Este método hace 2 requests; toggleFavoriteDirect hace 1.
   */
  toggleFavorite(testimonyId: number): Observable<any> {
    return this.getFavoritesCollectionId().pipe(
      switchMap((collectionId) =>
        this.http.post(`${this.apiUrl}/testimonios`, {
          id_coleccion: collectionId,
          id_testimonio: testimonyId,
        })
      )
    );
  }

  toggleFavoriteDirect(testimonyId: number): Observable<{ action: 'added' | 'removed'; favoriteIds: number[]; favoriteCount: number }> {
    return this.http.post<{ action: 'added' | 'removed'; favoriteIds: number[]; favoriteCount: number }>(
      `${this.apiUrl}/favorites/toggle/${testimonyId}`,
      {}
    );
  }

  addTestimony(collectionId: number, testimonyId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/testimonios`, {
      id_coleccion: collectionId,
      id_testimonio: testimonyId,
    });
  }

  removeTestimony(collectionId: number, testimonyId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${collectionId}/testimonios/${testimonyId}`,
    );
  }

  getTestimonies(collectionId: number, skip?: number, take?: number): Observable<Testimony[]> {
    let params = new HttpParams();
    if (skip !== undefined) params = params.set('skip', skip);
    if (take !== undefined) params = params.set('take', take);
    return this.http
      .get<{ data: Testimony[] }>(`${this.apiUrl}/${collectionId}/testimonios`, { params })
      .pipe(map((response) => response.data));
  }

}
