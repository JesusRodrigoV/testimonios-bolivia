import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { NotificationService, DateUtilsService } from "@app/core/services";
import { ActivatedRoute } from "@angular/router";
import { AuthStore } from "@app/auth.store";
import { FavoritesStore } from "@app/stores/favorites.store";
import { AddToCollectionComponent } from "@app/features/collections/components/add-to-collection";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MediaFormat } from "../../models/media-format";
import { Testimony } from "../../models/testimonio.model";
import { Transcripcion } from "../../models/transcription.model";
import {
  TestimonioService,
  TranscriptionService,
  CalificationService,
} from "../../services";

import { DatePipe, NgClass, Location } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { VideoPlayerComponent } from "@app/features/shared/video-player";
import { TestimonyCommentsComponent } from "../testimony/testimony-comments";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SpinnerComponent } from "@app/features/shared/ui/spinner";
import { ScrollTopDirective } from "@app/core/directives/scroll-top.directive";

@Component({
  selector: "app-testimony-detail",
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
    MatTooltipModule,
    SpinnerComponent,
    ScrollTopDirective,
  ],
  templateUrl: "./testimony-detail.component.html",
  styleUrl: "./testimony-detail.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TestimonyDetailComponent implements OnInit {
  testimony = signal<Testimony | null>(null);
  transcripciones = signal<Transcripcion[]>([]);
  currentRating = signal(0);
  currentRatingId = signal<number | null>(null);
  isMetaExpanded = signal(false);
  isTranscriptionExpanded = signal(false);
  isRatingLoading = signal(false);
  ratingControl = new FormControl<number | null>(null);
  isLoading = signal(true);
  isTranscribing = signal(false);
  isDescriptionExpanded = signal(false);

  relativeTime = computed(() => {
    const t = this.testimony();
    if (!t?.createdAt) return 'Desconocido';
    return this.dateUtilsService.getRelativeTime(t.createdAt);
  });

  canRequestTranscription = computed(() =>
    this.authStore.isAuthenticated() && this.transcripciones().length === 0 && !!this.testimony()
  );

  canDownload = computed(() => !!this.testimony());

  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private dateUtilsService = inject(DateUtilsService);
  private location = inject(Location);
  private dialog = inject(MatDialog);
  private testimonyService = inject(TestimonioService);
  private notification = inject(NotificationService);
  private transcriptionService = inject(TranscriptionService);
  private calificationService = inject(CalificationService);
  readonly authStore = inject(AuthStore);
  readonly favoritesStore = inject(FavoritesStore);
  readonly MediaFormat = MediaFormat;

  user = this.authStore.user;

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get("id");
      if (id && !isNaN(+id)) {
        this.loadTestimony(+id);
      } else {
        this.notification.error("ID de testimonio inválido");
        this.isLoading.set(false);
        this.goBack();
      }
    });
  }

  private loadTestimony(id: number) {
    this.isLoading.set(true);
    this.testimonyService.getTestimony(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (testimony) => {
        this.testimony.set(testimony);
        if (this.authStore.isAuthenticated()) {
          this.favoritesStore.loadFavorites();
          this.loadTranscriptions();
        }
        this.loadUserRating();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        this.notification.error("Error al cargar el testimonio");
        this.isLoading.set(false);
        this.goBack();
      },
    });
  }

  private loadTranscriptions() {
    if (!this.testimony()) return;
    this.transcriptionService
      .obtenerTranscripcionesPorTestimonio(this.testimony()!.id).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (transcripciones) => {
          this.transcripciones.set(transcripciones);
        },
        error: (error) => {
          this.notification.error("Error al cargar transcripciones");
        },
      });
  }

  private loadUserRating() {
    this.isRatingLoading.set(true);

    const t = this.testimony();
    const rating = t?.userRating;
    if (rating) {
      this.currentRating.set(rating.puntuacion);
      this.currentRatingId.set(rating.id_calificacion);
      this.ratingControl.setValue(rating.puntuacion, { emitEvent: false });
    } else {
      this.currentRating.set(0);
      this.currentRatingId.set(null);
      this.ratingControl.setValue(null, { emitEvent: false });
    }
    this.isRatingLoading.set(false);
  }

  esFavorito(): boolean {
    const id = this.testimony()?.id;
    return id ? this.favoritesStore.isFavorite(id) : false;
  }

  goBack() {
    this.location.back();
  }

  toggleMeta() {
    this.isMetaExpanded.set(!this.isMetaExpanded());
  }

  toggleTranscription() {
    this.isTranscriptionExpanded.set(!this.isTranscriptionExpanded());
  }

  toggleDescription() {
    this.isDescriptionExpanded.set(!this.isDescriptionExpanded());
  }

  requestTranscription() {
    if (!this.canRequestTranscription() || !this.testimony()) return;

    this.isTranscribing.set(true);
    this.transcriptionService
      .transcribirArchivo(this.testimony()!.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (transcripcion) => {
          this.transcripciones.set([transcripcion]);
          this.isTranscriptionExpanded.set(true);
          this.notification.success("Transcripción solicitada con éxito");
          this.isTranscribing.set(false);
        },
        error: (error) => {
          this.notification.error("Error al solicitar transcripción");
          this.isTranscribing.set(false);
        },
      });
  }

  rateTestimony(rating: number) {
    if (!this.authStore.isAuthenticated()) {
      this.notification.error("Debes iniciar sesión para calificar");
      return;
    }

    if (rating < 1 || rating > 5) {
      this.notification.error("La puntuación debe estar entre 1 y 5");
      return;
    }

    if (this.isRatingLoading() || !this.testimony()) return;

    if (this.currentRating() === rating && this.currentRatingId()) {
      this.isRatingLoading.set(true);
      this.calificationService.delete(this.currentRatingId()!).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.currentRating.set(0);
          this.currentRatingId.set(null);
          this.ratingControl.setValue(null, { emitEvent: false });
          this.notification.success("Calificación eliminada");
        },
        error: (error) => {
          this.notification.error(error.message || "Error al eliminar la calificación");
        },
        complete: () => {
          this.isRatingLoading.set(false);
        },
      });
      return;
    }

    this.isRatingLoading.set(true);

    if (this.currentRatingId()) {
      this.calificationService
        .update(this.currentRatingId()!, { puntuacion: rating })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (calificacion) => {
            this.currentRating.set(calificacion.puntuacion);
            this.ratingControl.setValue(calificacion.puntuacion, {
              emitEvent: false,
            });
            this.notification.success("Calificación actualizada");
          },
          error: (error) => {
            this.notification.error(error.message || "Error al actualizar la calificación");
          },
          complete: () => {
            this.isRatingLoading.set(false);
          },
        });
    } else {
      this.calificationService
        .create({ puntuacion: rating, id_testimonio: this.testimony()!.id })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (calificacion) => {
            this.currentRating.set(calificacion.puntuacion);
            this.currentRatingId.set(calificacion.id_calificacion);
            this.ratingControl.setValue(calificacion.puntuacion, {
              emitEvent: false,
            });
            this.notification.success("Calificación enviada");
          },
          error: (error) => {
            if (
              error.message.includes(
                "El usuario ya ha calificado este testimonio"
              )
            ) {
              this.loadUserRating();
              this.notification.error("Ya has calificado este testimonio");
            } else {
              this.notification.error(error.message || "Error al enviar la calificación");
            }
          },
          complete: () => {
            this.isRatingLoading.set(false);
          },
        });
    }
  }

  shareTestimony() {
    if (!this.testimony()) return;
    const url = `${window.location.origin}/testimonies/${this.testimony()!.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: this.testimony()!.title,
          text: this.testimony()!.description,
          url,
        })
        .catch(() => this.copyLink(url));
    } else {
      this.copyLink(url);
    }
  }

  addToCollection() {
    if (!this.authStore.isAuthenticated()) {
      this.notification.error("Debes iniciar sesión para agregar a una colección");
      return;
    }
    if (!this.testimony()) return;
    this.dialog.open(AddToCollectionComponent, {
      data: { testimonyId: this.testimony()!.id },
      width: "500px",
    });
  }

  async addToFavorites() {
    if (!this.testimony()) return;
    const id = this.testimony()!.id;
    if (!this.authStore.isAuthenticated()) {
      this.notification.error("Debes iniciar sesión para agregar a favoritos");
      return;
    }

    const result = await this.favoritesStore.toggleFavorite(id);
    const msg = result.action === 'added'
      ? "Testimonio agregado a favoritos"
      : "Testimonio eliminado de favoritos";
    this.notification.info(msg);

    if (this.testimony()) {
      this.testimony.update(t => t ? { ...t, favoriteCount: result.favoriteCount } : null);
    }
  }

  downloadTestimony() {
    if (!this.testimony()) return;
    if (!this.authStore.isAuthenticated()) {
      this.notification.error("Debes iniciar sesión para descargar este testimonio");
      return;
    }
    this.testimonyService.downloadTestimony(this.testimony()!.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const a = document.createElement("a");
        a.href = response.url;
        a.download = this.testimony()!.title || "testimonio";
        a.click();
      },
      error: (err) => {
        this.notification.error(err.message || "Error al descargar el testimonio");
      },
    });
  }

  private copyLink(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      this.notification.success("Enlace copiado al portapapeles");
    });
  }
}
