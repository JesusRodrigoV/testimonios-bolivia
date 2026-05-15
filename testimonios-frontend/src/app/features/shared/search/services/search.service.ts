import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchQuerySubject = new BehaviorSubject<string>('');
  searchQuery$ = this.searchQuerySubject.asObservable();

  private showResultsSubject = new BehaviorSubject<boolean>(false);
  showResults$ = this.showResultsSubject.asObservable();

  setSearchQuery(query: string) {
    this.searchQuerySubject.next(query);
    this.showResultsSubject.next(!!query.trim()); 
  }

  clearSearchQuery() {
    this.searchQuerySubject.next('');
    this.showResultsSubject.next(false);
  }

  toggleResults(show: boolean) {
    this.showResultsSubject.next(show);
  }
}
