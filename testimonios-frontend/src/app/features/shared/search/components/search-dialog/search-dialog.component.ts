import { AsyncPipe, DatePipe, SlicePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SpinnerComponent } from '@app/features/shared/ui/spinner';
import { Testimony } from '@app/features/testimony/models/testimonio.model';
import { Router } from '@angular/router';
import { TestimonioService } from '@app/features/testimony/services';
import {
  Subject,
  switchMap,
  takeUntil,
  catchError,
  of,
} from 'rxjs';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search-dialog',
  imports: [
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatListModule,
    MatProgressBarModule,
    SpinnerComponent,
    DatePipe,
    SlicePipe,
    AsyncPipe,
  ],
  templateUrl: './search-dialog.component.html',
  styleUrl: './search-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchDialogComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private destroyed$ = new Subject<void>();
  private cancelLoadMore$ = new Subject<void>();
  private testimonioService = inject(TestimonioService);
  private searchService = inject(SearchService);
  private router = inject(Router);

  constructor() {
    this.destroyRef.onDestroy(() => this.destroyed$.next());
  }

  showResults$ = this.searchService.showResults$;
  searchQuery = signal('');
  testimonies = signal<Testimony[]>([]);
  loading = signal(false);
  searching = signal(false);
  error = signal<string | null>(null);
  total = signal(0);
  cursor = signal<string | null>(null);
  limit = 10;
  hasMore = signal(true);

  ngOnInit() {
    this.searchService.searchQuery$
      .pipe(
        takeUntil(this.destroyed$),
        switchMap((query) => {
          this.searchQuery.set(query);
          this.cancelLoadMore$.next();

          if (!query.trim()) {
            this.resetState();
            return of(null);
          }

          this.error.set(null);
          const isFirstSearch = this.testimonies().length === 0;
          if (isFirstSearch) this.loading.set(true);
          this.searching.set(true);

          return this.testimonioService
            .searchTestimonies({ keyword: query, limit: this.limit })
            .pipe(
              catchError((err) => {
                this.error.set(err.message || 'Error al buscar testimonios');
                return of({ data: [], pagination: { total: 0, hasMore: false, cursor: null } });
              }),
            );
        }),
      )
      .subscribe((response) => {
        if (!response) return;
        this.testimonies.set(response.data);
        this.total.set(response.pagination.total);
        this.hasMore.set(response.pagination.hasMore);
        this.cursor.set(null);
        this.loading.set(false);
        this.searching.set(false);
      });
  }

  private resetState() {
    this.testimonies.set([]);
    this.loading.set(false);
    this.searching.set(false);
    this.error.set(null);
    this.cursor.set(null);
    this.hasMore.set(true);
  }

  loadMore() {
    if (!this.hasMore() || this.searching() || !this.searchQuery().trim()) return;

    this.searching.set(true);

    this.testimonioService
      .searchTestimonies({
        keyword: this.searchQuery(),
        limit: this.limit,
        cursor: this.cursor(),
      })
      .pipe(takeUntil(this.destroyed$), takeUntil(this.cancelLoadMore$))
      .subscribe({
        next: (response) => {
          this.testimonies.set([...this.testimonies(), ...response.data]);
          this.total.set(response.pagination.total);
          this.hasMore.set(response.pagination.hasMore);
          this.cursor.set(response.pagination.cursor);
          this.searching.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar más resultados');
          this.searching.set(false);
        },
      });
  }

  onTestimonySelect(testimony: Testimony) {
    this.router.navigate(['/testimonies', testimony.id]);
    this.searchService.clearSearchQuery();
  }

  onTestimonyKeydown(event: KeyboardEvent, testimony: Testimony) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onTestimonySelect(testimony);
    }
  }

  closeResults() {
    this.searchService.clearSearchQuery();
  }
}
