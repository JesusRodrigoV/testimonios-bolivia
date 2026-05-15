
import { DatePipe, NgClass } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MediaFormat } from "@app/features/testimony/models/media-format";
import { Testimony } from "@app/features/testimony/models/testimonio.model";
import { TestimonyCommentsComponent } from "../testimony-comments";
import { MatDialogModule } from "@angular/material/dialog";
import { CalificationService, TestimonioService, TranscriptionService } from "@app/features/testimony/services";

import { MatMenuModule } from "@angular/material/menu";
import { VideoPlayerComponent } from "@app/features/shared/video-player";
import { AddToCollectionComponent } from "@app/features/collections/components/add-to-collection";
import { AuthStore } from "@app/auth.store";
import { FavoritesStore } from "@app/stores/favorites.store";
import { CollectionService } from "@app/features/collections/services";
import { NotificationService } from '@app/core/services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Transcripcion } from "@app/features/testimony/models/transcription.model";

@Component({
  selector: "app-testimony-modal",
  imports: [
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatDialogModule,
    DatePipe,
    TestimonyCommentsComponent,
    NgClass,
    ReactiveFormsModule,
    MatMenuModule,
    FormsModule,
    VideoPlayerComponent,
  ],
  templateUrl: "./testimony-modal.component.html",
  styleUrl: "./testimony-modal.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonyModalComponent implements OnInit {
  readonly MediaFormat = MediaFormat;
  currentRating = signal(0);
  currentRatingId = signal<number | null>(null);
  isMetaExpanded = signal(false);
  isTranscriptionExpanded = signal(false);
  isRatingLoading = signal(false);
  ratingControl = new FormControl<number | null>(null);
  transcripciones = signal<Transcripcion[]>([]);

  canRequestTranscription = computed(() =>
    this.authStore.isAuthenticated() && this.transcripciones().length === 0
  );

  canDownload = computed(() => true);

  relativeTime = computed(() => {
    const createdAt = this.testimony.createdAt;
    if (!createdAt) return 'Desconocido';
    const now = new Date();
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    if (isNaN(date.getTime())) return 'Fecha inválida';
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);
    if (diffSec < 60) return 'hace un instante';
    if (diffMin < 60) return `hace ${diffMin} minuto${diffMin === 1 ? '' : 's'}`;
    if (diffHr < 24) return `hace ${diffHr} hora${diffHr === 1 ? '' : 's'}`;
    if (diffDay < 30) return `hace ${diffDay} día${diffDay === 1 ? '' : 's'}`;
    if (diffMonth < 12) return `hace ${diffMonth} mes${diffMonth === 1 ? '' : 'es'}`;
    return `hace ${diffYear} año${diffYear === 1 ? '' : 's'}`;
  });

  readonly dialogRef = inject(MatDialogRef<TestimonyModalComponent>);
  readonly dialog = inject(MatDialog);
  readonly data = inject(MAT_DIALOG_DATA);
  readonly testimony: Testimony = this.data.testimony;
  readonly testimonyService = inject(TestimonioService);
  readonly authStore = inject(AuthStore);
  readonly favoritesStore = inject(FavoritesStore);
  readonly notification = inject(NotificationService);
  readonly collectionService = inject(CollectionService);
  readonly transcriptionService = inject(TranscriptionService);
  readonly calificationService = inject(CalificationService);
  readonly cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    if (this.authStore.isAuthenticated()) {
      this.favoritesStore.loadFavorites();
    }
    this.loadFavoriteCount();
    this.loadTranscriptions();
    this.loadUserRating();
  }

  private loadFavoriteCount() {
    this.collectionService.getFavoriteCount(this.testimony.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (count: number) => {
        this.testimony.favoriteCount = count;
        this.cdr.markForCheck();
      },
    });
  }

  private loadTranscriptions() {
    this.transcriptionService
      .obtenerTranscripcionesPorTestimonio(this.testimony.id).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (transcripciones) => {
        this.transcripciones.set(transcripciones);
      },
        error: (error) => {
          this.notification.error('Error al cargar transcripciones');
        },
      });
  }

  private loadUserRating() {
    if (!this.authStore.isAuthenticated()) {
      this.currentRating.set(0);
      this.currentRatingId.set(null);
      this.ratingControl.setValue(null, { emitEvent: false });
      return;
    }

    this.isRatingLoading.set(true);

    this.calificationService.getUserRatingForTestimony(this.testimony.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (calificacion) => {
        if (calificacion) {
          this.currentRating.set(calificacion.puntuacion);
          this.currentRatingId.set(calificacion.id_calificacion);
          this.ratingControl.setValue(calificacion.puntuacion, { emitEvent: false });
        } else {
          this.currentRating.set(0);
          this.currentRatingId.set(null);
          this.ratingControl.setValue(null, { emitEvent: false });
        }
        this.isRatingLoading.set(false);
      },
      error: (error) => {
        this.notification.error('Error al cargar la calificación');
        this.currentRating.set(0);
        this.currentRatingId.set(null);
        this.ratingControl.setValue(null, { emitEvent: false });
        this.isRatingLoading.set(false);
      }
    });
  }

  esFavorito(): boolean {
    return this.favoritesStore.isFavorite(this.testimony.id);
  }

  closeModal() {
    this.dialogRef.close();
  }

  toggleMeta() {
    this.isMetaExpanded.set(!this.isMetaExpanded());
  }

  toggleTranscription() {
    this.isTranscriptionExpanded.set(!this.isTranscriptionExpanded());
  }

  requestTranscription() {
    if (!this.canRequestTranscription()) return;

    this.transcriptionService.transcribirArchivo(this.testimony.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (transcripcion) => {
        this.transcripciones.set([transcripcion]);
        this.isTranscriptionExpanded.set(true);
        this.notification.success('Transcripción solicitada con éxito');
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.notification.error('Error al solicitar transcripción');
      },
    });
  }

  rateTestimony(rating: number) {
    if (!this.authStore.isAuthenticated()) {
      this.notification.error('Debes iniciar sesión para calificar');
      return;
    }

    if (rating < 1 || rating > 5) {
      this.notification.error('La puntuación debe estar entre 1 y 5');
      return;
    }

    if (this.isRatingLoading()) return;

    // Si intenta calificar con el mismo valor, eliminar la calificación
    if (this.currentRating() === rating && this.currentRatingId()) {
      this.isRatingLoading.set(true);
      this.calificationService.delete(this.currentRatingId()!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.currentRating.set(0);
          this.currentRatingId.set(null);
          this.ratingControl.setValue(null, { emitEvent: false });
          this.notification.success('Calificación eliminada');
        },
        error: (error) => {
          this.notification.error(error.message || 'Error al eliminar la calificación');
        },
        complete: () => {
          this.isRatingLoading.set(false);
        }
      });
      return;
    }

    this.isRatingLoading.set(true);

    if (this.currentRatingId()) {
      // Actualizar calificación existente
      this.calificationService.update(this.currentRatingId()!, { puntuacion: rating }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (calificacion) => {
          this.currentRating.set(calificacion.puntuacion);
          this.ratingControl.setValue(calificacion.puntuacion, { emitEvent: false });
          this.notification.success('Calificación actualizada');
        },
        error: (error) => {
          this.notification.error(error.message || 'Error al actualizar la calificación');
        },
        complete: () => {
          this.isRatingLoading.set(false);
        }
      });
    } else {
      // Crear nueva calificación
      this.calificationService.create({ puntuacion: rating, id_testimonio: this.testimony.id }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (calificacion) => {
          this.currentRating.set(calificacion.puntuacion);
          this.currentRatingId.set(calificacion.id_calificacion);
          this.ratingControl.setValue(calificacion.puntuacion, { emitEvent: false });
          this.notification.success('Calificación enviada');
        },
        error: (error) => {
          if (error.message.includes('El usuario ya ha calificado este testimonio')) {
            // Reintentar cargar la calificación existente
            this.loadUserRating();
            this.notification.info('Ya has calificado este testimonio');
          } else {
            this.notification.error(error.message || 'Error al enviar la calificación');
          }
        },
        complete: () => {
          this.isRatingLoading.set(false);
        }
      });
    }
  }

  shareTestimony() {
    const url = `${window.location.origin}/testimonies/${this.testimony.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: this.testimony.title,
          text: this.testimony.description,
          url,
        })
        .catch(() => this.copyLink(url));
    } else {
      this.copyLink(url);
    }
  }

  addToCollection() {
    if (!this.authStore.isAuthenticated()) {
      this.notification.error('Debes iniciar sesión para agregar a una colección');
      return;
    }
    this.dialog.open(AddToCollectionComponent, {
      data: { testimonyId: this.testimony.id },
      width: '500px',
    });
  }

  async addToFavorites() {
    const id = this.testimony.id;
    if (!this.authStore.isAuthenticated()) {
      this.notification.error('Debes iniciar sesión para agregar a favoritos');
      return;
    }

    const result = await this.favoritesStore.toggleFavorite(id);
    this.testimony.favoriteCount = result.favoriteCount;
    const msg = result.action === 'added'
      ? 'Testimonio agregado a favoritos'
      : 'Testimonio eliminado de favoritos';
    this.notification.success(msg);
    this.cdr.markForCheck();
  }

  downloadTestimony() {
    if (!this.authStore.isAuthenticated()) {
      this.notification.error('Debes iniciar sesión para descargar este testimonio');
      return;
    }
    this.testimonyService.downloadTestimony(this.testimony.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const a = document.createElement('a');
        a.href = response.url;
        a.download = `${this.testimony.title || 'testimonio'}`;
        a.click();
      },
      error: (err) => {
        this.notification.error(err.message || 'Error al descargar el testimonio');
      },
    });
  }

  private copyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      this.notification.success('Enlace copiado al portapapeles');
    });
  }

  getRelativeTime(createdAt: string | Date): string {
    if (!createdAt) return 'Desconocido';

    const now = new Date();
    const date = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    if (isNaN(date.getTime())) return 'Fecha inválida';

    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffMonth / 12);

    if (diffSec < 60) {
      return 'hace un instante';
    } else if (diffMin < 60) {
      return `hace ${diffMin} minuto${diffMin === 1 ? '' : 's'}`;
    } else if (diffHr < 24) {
      return `hace ${diffHr} hora${diffHr === 1 ? '' : 's'}`;
    } else if (diffDay < 30) {
      return `hace ${diffDay} día${diffDay === 1 ? '' : 's'}`;
    } else if (diffMonth < 12) {
      return `hace ${diffMonth} mes${diffMonth === 1 ? '' : 'es'}`;
    } else {
      return `hace ${diffYear} año${diffYear === 1 ? '' : 's'}`;
    }
  }
}
