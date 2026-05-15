import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Testimony } from '@app/features/testimony/models/testimonio.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/testimonies`;

  private http = inject(HttpClient);

  searchTestimonies(query: string, filter?: string): Observable<Testimony[]> {
    let params = new HttpParams().set('query', query);
    if (filter) {
      params = params.set('filter', filter);
    }
    return this.http.get<Testimony[]>(`${this.apiUrl}/search`, { params });
  }
}
