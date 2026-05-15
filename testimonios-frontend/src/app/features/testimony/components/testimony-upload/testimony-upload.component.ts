import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatChipInputEvent, MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MediaFormat } from "@app/features/testimony/models/media-format";
import { TestimonyInput } from "@app/features/testimony/models/testimonio.model";
import { environment } from "src/environment/environment";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from "@angular/forms";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { TestimonioService } from "@app/features/testimony/services";
import { ExploreFiltersStore, ExploreCategory, ExploreEvent, ExploreTag } from "@app/features/testimony/stores/explore-filters.store";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { NotificationService } from "@app/core/services";
import { SpinnerComponent } from "@app/features/shared/ui/spinner";
import { Router } from "@angular/router";
import { FileUploadComponent } from "./file-upload";
import { MatStepperModule } from "@angular/material/stepper";

@Component({
  selector: "app-testimony-upload",
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatCheckboxModule,
    MatStepperModule,
    SpinnerComponent,
    FileUploadComponent,
  ],
  templateUrl: "./testimony-upload.component.html",
  styleUrl: "./testimony-upload.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TestimonyUploadComponent implements OnInit {
  testimony: TestimonyInput & {
    selectedTags: string[];
    selectedCategories: string[];
  } = {
    title: '',
    description: '',
    content: '',
    selectedTags: [],
    selectedCategories: [],
    eventId: undefined,
    latitude: undefined,
    longitude: undefined,
    url: '',
    duration: undefined,
    format: undefined,
  };
  cloudinaryResult: {
    secure_url: string;
    duration?: number;
    format: string;
  } | null = null;
  mediaPreview: string | null = null;
  mediaType: MediaFormat | null = null;
  shareLocation: boolean = false;
  submitting = false;
  cargandoTestimonio = signal(false);
  eventName = signal<string>('Ninguno');

  categories: ExploreCategory[] = [];
  tags: ExploreTag[] = [];
  events: ExploreEvent[] = [];

  tagCtrl = new FormControl<string>('');
  separatorKeysCodes: number[] = [ENTER, COMMA];

  get filteredTags(): string[] {
    return this._filterTags(this.tagCtrl.value ?? '');
  }

  private testimonyService = inject(TestimonioService);
  private exploreFiltersStore = inject(ExploreFiltersStore);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadMetadata();
  }

  async loadMetadata(): Promise<void> {
    await this.exploreFiltersStore.loadFilters();

    this.categories = this.exploreFiltersStore.categories();
    this.tags = this.exploreFiltersStore.tags();
    this.events = this.exploreFiltersStore.events();
    this.updateEventName();
  }

  private _filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.tags
      .map((tag) => tag.name)
      .filter((tag) => tag.toLowerCase().includes(filterValue));
  }

  async onFileSelected(file: File | null): Promise<void> {
    if (!file) {
      this.cloudinaryResult = null;
      this.mediaPreview = null;
      this.mediaType = null;
      this.testimony.url = '';
      this.testimony.duration = undefined;
      this.testimony.format = undefined;
      return;
    }

    this.cargandoTestimonio.set(true);

    if (file.type.startsWith('video/')) {
      this.mediaType = MediaFormat.Video;
    } else if (file.type.startsWith('audio/')) {
      this.mediaType = MediaFormat.Audio;
    } else if (file.type.startsWith('image/')) {
      this.mediaType = MediaFormat.Image;
    } else {
      this.cargandoTestimonio.set(false);
      this.openSnackBar(
        'Formato no soportado. Subí video, audio o imagen.',
        'Cerrar',
        'error',
      );
      return;
    }
    if (this.mediaPreview) {
      URL.revokeObjectURL(this.mediaPreview);
    }
    this.mediaPreview = URL.createObjectURL(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', environment.cloudinary.uploadPreset);
    formData.append('folder', 'legado_bolivia/testimonies');
    formData.append('resource_type', 'auto');

    try {
      const response = await fetch(
        `${environment.cloudinary.uploadUrl}/upload`,
        {
          method: 'POST',
          body: formData,
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.error?.message || 'Error al subir archivo a Cloudinary',
        );
      }
      this.cloudinaryResult = {
        secure_url: result.secure_url,
        duration: result.duration,
        format: result.format,
      };
      this.testimony.url = result.secure_url;
      this.testimony.duration = result.duration
        ? Math.round(result.duration)
        : undefined;
      this.testimony.format = this.mediaType;
      this.openSnackBar('Archivo subido exitosamente', 'Cerrar', 'success');
      this.cargandoTestimonio.set(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al subir archivo';
      this.openSnackBar(errorMessage, 'Reintentar', 'error');
      this.cloudinaryResult = null;
      this.mediaPreview = null;
      this.mediaType = null;
      this.testimony.url = '';
      this.testimony.duration = undefined;
      this.testimony.format = undefined;
      this.cargandoTestimonio.set(false);
    }
  }

  onShareLocationChange(): void {
    if (this.shareLocation) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.testimony.latitude = position.coords.latitude;
            this.testimony.longitude = position.coords.longitude;
            this.openSnackBar(
              'Ubicación obtenida exitosamente',
              'Cerrar',
              'success',
            );
          },
          (error) => {
            this.shareLocation = false;
            this.testimony.latitude = undefined;
            this.testimony.longitude = undefined;
            this.openSnackBar(
              'No se pudo obtener la ubicación: ' + error.message,
              'Cerrar',
              'error',
            );
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      } else {
        this.shareLocation = false;
        this.openSnackBar(
          'La geolocalización no está disponible en este navegador',
          'Cerrar',
          'error',
        );
      }
    } else {
      this.testimony.latitude = undefined;
      this.testimony.longitude = undefined;
    }
  }

  markFileStepTouched(): void {
    this.fileUploadTouched.set(true);
  }

  submitTestimony(): void {
    if (!this.cloudinaryResult) {
      this.openSnackBar(
        'Por favor, sube un archivo antes de enviar',
        'Cerrar',
        'error',
      );
      return;
    }

    this.submitting = true;

    const payload: TestimonyInput = {
      title: this.testimony.title,
      description: this.testimony.description,
      url: this.testimony.url,
      duration: this.testimony.duration,
      format: this.testimony.format,
      content: this.testimony.content || undefined,
      tags: this.testimony.selectedTags,
      categories: this.testimony.selectedCategories,
      eventId:
        this.testimony.eventId === null ? undefined : this.testimony.eventId,
      latitude:
        this.testimony.latitude === null ? undefined : this.testimony.latitude,
      longitude:
        this.testimony.longitude === null
          ? undefined
          : this.testimony.longitude,
    };

    this.testimonyService.createTestimony(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.openSnackBar(
          'Testimonio subido exitosamente. Esperando aprobación de administrador',
          'Cerrar',
          'success',
        );
        this.submitting = false;
        this.resetForm();
        this.router.navigate(['/explore']);
      },
      error: (err) => {
        let errorMessage =
          err.message || 'Error al enviar testimonio al servidor';
        if (err.message.includes('url')) {
          errorMessage =
            'Error con el archivo multimedia. Por favor, intenta subir el archivo nuevamente.';
        } else if (err.message.includes('eventId')) {
          errorMessage =
            'Error con el evento seleccionado. Por favor, verifica la selección.';
        } else if (err.message.includes('Invalid type')) {
          errorMessage =
            'Error en los datos numéricos (evento, latitud o longitud). Déjalos en blanco si no aplican.';
        }
        this.openSnackBar(errorMessage, 'Reintentar', 'error');
        this.submitting = false;
      },
    });
  }

  resetForm(): void {
    this.testimony = {
      title: '',
      description: '',
      content: '',
      selectedTags: [],
      selectedCategories: [],
      eventId: undefined,
      latitude: undefined,
      longitude: undefined,
      url: '',
      duration: undefined,
      format: undefined,
    };
      this.cloudinaryResult = null;
      if (this.mediaPreview) {
        URL.revokeObjectURL(this.mediaPreview);
      }
      this.mediaPreview = null;
    this.mediaType = null;
    this.shareLocation = false;
    this.tagCtrl.setValue('');
    this.eventName.set('Ninguno');
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.testimony.selectedTags.includes(value)) {
      this.testimony.selectedTags.push(value);
    }
    event.chipInput!.clear();
    this.tagCtrl.setValue('');
  }

  removeTag(tag: string): void {
    const index = this.testimony.selectedTags.indexOf(tag);
    if (index >= 0) {
      this.testimony.selectedTags.splice(index, 1);
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    const value: string = event.option.value;
    if (!this.testimony.selectedTags.includes(value)) {
      this.testimony.selectedTags.push(value);
    }
    this.tagCtrl.setValue('');
  }

  openSnackBar(message: string, action: string, type: 'success' | 'error'): void {
    if (type === 'success') {
      this.notification.success(message, action);
    } else {
      this.notification.error(message, action);
    }
  }

  fileUploadTouched = signal(false);

  isFileUploaded(): boolean {
    return !!this.cloudinaryResult;
  }

  isInfoFormValid(): boolean {
    return this.testimony.title.trim().length >= 3
      && this.testimony.description.trim().length >= 5;
  }

  isMetaFormValid(): boolean {
    return this.testimony.selectedCategories.length > 0
      || this.testimony.selectedTags.length > 0;
  }

  updateEventName(): void {
    const event = this.events.find((e) => e.id === this.testimony.eventId);
    this.eventName.set(event?.name ?? 'Ninguno');
  }

  onEventChange(): void {
    this.updateEventName();
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}
