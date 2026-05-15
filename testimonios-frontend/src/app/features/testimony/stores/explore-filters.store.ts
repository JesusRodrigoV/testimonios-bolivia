import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { TestimonioService } from '@app/features/testimony/services';
import { firstValueFrom, forkJoin } from 'rxjs';

export interface ExploreCategory {
  id_categoria: number;
  nombre: string;
  descripcion: string;
}

export interface ExploreEvent {
  id: number;
  name: string;
  description: string;
  date: string;
}

export interface ExploreTag {
  id: number;
  name: string;
}

interface ExploreFiltersState {
  categories: ExploreCategory[];
  events: ExploreEvent[];
  tags: ExploreTag[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

const initialState: ExploreFiltersState = {
  categories: [],
  events: [],
  tags: [],
  loading: false,
  loaded: false,
  error: null,
};

export const ExploreFiltersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const testimonioService = inject(TestimonioService);
    return {
    async loadFilters() {
      if (store.loaded() || store.loading()) return;

      patchState(store, { loading: true, error: null });

      try {
        const [categories, events, tags] = await firstValueFrom(
          forkJoin([
            testimonioService.getAllCategories(),
            testimonioService.getAllEvents(),
            testimonioService.getAllTags(),
          ]),
        );

        patchState(store, {
          categories,
          events,
          tags,
          loading: false,
          loaded: true,
        });
      } catch (error: any) {
        patchState(store, {
          loading: false,
          error: error.message || 'Error al cargar filtros',
        });
      }
    },
    };
  }),
);
