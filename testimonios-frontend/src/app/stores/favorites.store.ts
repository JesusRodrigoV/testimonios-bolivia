import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { CollectionService } from '@app/features/collections/services';
import { firstValueFrom } from 'rxjs';

interface FavoritesState {
  favoriteIds: number[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  favoriteIds: [],
  loaded: false,
  loading: false,
  error: null,
};

export const FavoritesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    favoriteCount: computed(() => store.favoriteIds().length),
  })),
  withMethods((store, collectionService = inject(CollectionService)) => ({
    isFavorite(id: number): boolean {
      return store.favoriteIds().includes(id);
    },

    async loadFavorites() {
      if (store.loaded() || store.loading()) return;

      patchState(store, { loading: true, error: null });

      try {
        const ids = await firstValueFrom(collectionService.getFavorites());
        patchState(store, { favoriteIds: ids, loading: false, loaded: true });
      } catch (error: any) {
        patchState(store, {
          loading: false,
          error: error.message || 'Error al cargar favoritos',
        });
      }
    },

    async toggleFavorite(testimonyId: number): Promise<{ action: 'added' | 'removed'; favoriteCount: number }> {
      const previous = store.favoriteIds();
      const wasFavorite = previous.includes(testimonyId);
      const updated = wasFavorite
        ? previous.filter((id) => id !== testimonyId)
        : [...previous, testimonyId];

      patchState(store, { favoriteIds: updated, error: null });

      try {
        const response = await firstValueFrom(
          collectionService.toggleFavoriteDirect(testimonyId),
        );
        patchState(store, { favoriteIds: response.favoriteIds });
        return { action: response.action, favoriteCount: response.favoriteCount };
      } catch (error: any) {
        patchState(store, {
          favoriteIds: previous,
          error: error.message || 'Error al actualizar favorito',
        });
        return { action: wasFavorite ? 'added' : 'removed' as const, favoriteCount: 0 };
      }
    },

    reset() {
      patchState(store, initialState);
    },
  })),
);
