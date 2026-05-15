import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { Testimony } from '@app/features/testimony/models/testimonio.model';
import { SpinnerComponent } from '@app/features/shared/ui/spinner';
import { TestimonyComponent } from '../testimony/testimony.component';
import { TestimonioService } from '@app/features/testimony/services';
import { ExploreFiltersStore } from '@app/features/testimony/stores/explore-filters.store';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoriesFiltersComponent } from '@app/features/shared/categories-filters';
import { EventsFiltersComponent } from '@app/features/shared/events-filters';
import { TagsFiltersComponent } from '@app/features/shared/tags-filters';

@Component({
  selector: 'app-testimony-feed',
  imports: [TestimonyComponent, SpinnerComponent, MatIconModule, CategoriesFiltersComponent, EventsFiltersComponent, TagsFiltersComponent],
  templateUrl: './testimony-feed.component.html',
  styleUrl: './testimony-feed.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TestimonyFeedComponent implements OnInit, OnDestroy {
  testimonies: WritableSignal<Testimony[]> = signal([]);
  cursor: WritableSignal<string | null> = signal(null);
  limit: WritableSignal<number> = signal(10);
  total: WritableSignal<number> = signal(0);
  loading: WritableSignal<boolean> = signal(false);
  hasMore: WritableSignal<boolean> = signal(true);
  error: WritableSignal<string | null> = signal(null);
  selectedCategories: WritableSignal<number[]> = signal([]);
  selectedEvents: WritableSignal<number[]> = signal([]);
  selectedTags: WritableSignal<number[]> = signal([]);
  isSidebarOpen: WritableSignal<boolean> = signal(false);

  loadMoreTrigger = viewChild<ElementRef>('loadMoreTrigger');
  private testimonioService = inject(TestimonioService);
  private exploreFiltersStore = inject(ExploreFiltersStore);
  private destroyRef = inject(DestroyRef);
  private observer: IntersectionObserver | null = null;

  ngOnInit() {
    this.exploreFiltersStore.loadFilters();
    this.setupIntersectionObserver();
    this.loadTestimonies(false);
  }

  onFilterChange() {
    this.resetAndLoad();
  }

  clearFilters() {
    this.selectedCategories.set([]);
    this.selectedEvents.set([]);
    this.selectedTags.set([]);
  }

  toggleSidebar() {
    this.isSidebarOpen.update((value) => !value);
  }

  private resetAndLoad() {
    this.cursor.set(null);
    this.testimonies.set([]);
    this.hasMore.set(true);
    this.error.set(null);
    this.loadTestimonies(false);
  }

  loadTestimonies(append = true) {
    if (this.loading() || !this.hasMore()) return;

    this.loading.set(true);
    this.error.set(null);

    const params: {
      category?: string; eventId?: number; tag?: string;
      limit: number; cursor?: string | null;
    } = {
      category: this.selectedCategories().length ? this.selectedCategories().join(',') : undefined,
      eventId: this.selectedEvents().length ? this.selectedEvents()[0] : undefined,
      tag: this.selectedTags().length ? this.selectedTags().join(',') : undefined,
      limit: this.limit(),
      cursor: append ? this.cursor() : undefined,
    };

    this.testimonioService.searchTestimonies(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if (append) {
          this.testimonies.update((current) => [...current, ...response.data]);
        } else {
          this.testimonies.set(response.data);
        }
        this.total.set(response.pagination.total);
        this.hasMore.set(response.pagination.hasMore);
        this.cursor.set(response.pagination.cursor);
        this.loading.set(false);
        this.observeLoadMore();
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar los testimonios');
        this.loading.set(false);
      },
    });
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && this.hasMore() && !this.loading()) {
          this.loadTestimonies();
        }
      },
      { threshold: 0.1 }
    );
  }

  private observeLoadMore() {
    const trigger = this.loadMoreTrigger();
    if (trigger?.nativeElement) {
      this.observer?.observe(trigger.nativeElement);
    }
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  trackById(index: number, testimony: Testimony): number {
    return testimony.id;
  }
}