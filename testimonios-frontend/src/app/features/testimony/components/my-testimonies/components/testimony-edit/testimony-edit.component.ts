import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { NotificationService } from '@app/core/services/notification.service';
import { ActivatedRoute, Router } from "@angular/router";
import { SpinnerComponent } from "@app/features/shared/ui/spinner";
import { VideoPlayerComponent } from "@app/features/shared/video-player";
import { MediaFormat } from "@app/features/testimony/models/media-format";
import { Testimony } from "@app/features/testimony/models/testimonio.model";
import { TestimonioService } from "@app/features/testimony/services";
import { ExploreFiltersStore } from "@app/features/testimony/stores/explore-filters.store";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: "app-testimony-edit",
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatAutocompleteModule,
    SpinnerComponent,
    VideoPlayerComponent,
    DatePipe,
  ],
  templateUrl: "./testimony-edit.component.html",
  styleUrl: "./testimony-edit.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TestimonyEditComponent {
  readonly MediaFormat = MediaFormat;
  private route = inject(ActivatedRoute);
  private testimonyService = inject(TestimonioService);
  private exploreFiltersStore = inject(ExploreFiltersStore);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  testimony = signal<Testimony | null>(null);
  categories = signal<
    { id_categoria: number; nombre: string; descripcion: string }[]
  >([]);
  events = signal<
    { id: number; name: string; description: string; date: string }[]
  >([]);
  allTags = signal<string[]>([]);
  filteredTags = signal<string[]>([]);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);
  separatorKeysCodes = [13, 188];
  tagCtrl = new FormControl("");

  form = this.fb.group({
    title: ["", [Validators.required, Validators.minLength(3)]],
    description: ["", [Validators.required, Validators.minLength(5)]],
    content: ["", [Validators.required, Validators.minLength(5)]],
    categories: [[] as string[]],
    tags: [[] as string[]],
    eventId: [null as number | null],
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (!isNaN(id)) {
      this.loadData(id);
    }

    this.tagCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateFilteredTags());
  }

  private updateFilteredTags() {
    const tags = this.allTags();
    const input = this.tagCtrl.value?.toLowerCase() || "";
    const currentTags = this.form.get("tags")?.value ?? [];
    this.filteredTags.set(
      tags.filter(
        (tag) =>
          tag.toLowerCase().includes(input) && !currentTags.includes(tag)
      )
    );
  }

  async loadData(id: number) {
    this.loading.set(true);

    try {
      await this.exploreFiltersStore.loadFilters();

      const categories = this.exploreFiltersStore.categories();
      const events = this.exploreFiltersStore.events();
      const tags = this.exploreFiltersStore.tags();

      this.testimonyService.getTestimony(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (testimony) => {
            this.testimony.set(testimony);
            this.categories.set(categories);
            this.events.set(events);
            this.allTags.set(tags.map((t) => t.name));
            this.updateFilteredTags();
            this.form.patchValue({
              title: testimony.title ?? "",
              description: testimony.description ?? "",
              content: testimony.content ?? "",
              categories: testimony.categories ?? [],
              tags: testimony.tags ?? [],
              eventId: testimony.event ? Number(testimony.event) : null,
            });
            this.loading.set(false);
          },
          error: () => {
            this.notification.error("Error al cargar el testimonio");
            this.router.navigate(["/my-testimonies"]);
            this.loading.set(false);
          },
        });
    } catch {
      this.notification.error("Error al cargar datos");
      this.loading.set(false);
    }
  }

  addTag(event: any) {
    const value = (event.value || "").trim();
    const currentTags = this.form.get("tags")?.value ?? [];
    if (value && !currentTags.includes(value)) {
      this.form.get("tags")?.setValue([...currentTags, value]);
      this.tagCtrl.setValue("");
      event.chipInput!.clear();
    }
  }

  removeTag(tag: string) {
    const currentTags = this.form.get("tags")?.value ?? [];
    const tags = currentTags.filter((t: string) => t !== tag);
    this.form.get("tags")?.setValue(tags);
  }

  selectedTag(event: any) {
    const value = event.option.value;
    const currentTags = this.form.get("tags")?.value ?? [];
    if (!currentTags.includes(value)) {
      this.form.get("tags")?.setValue([...currentTags, value]);
      this.tagCtrl.setValue("");
    }
  }

  submit() {
    if (this.form.invalid || !this.testimony() || this.submitting()) return;

    this.submitting.set(true);
    const data: Partial<Testimony> = {
      title: this.form.get("title")?.value ?? undefined,
      description: this.form.get("description")?.value ?? undefined,
      content: this.form.get("content")?.value ?? undefined,
      categories: this.form.get("categories")?.value ?? undefined,
      tags: this.form.get("tags")?.value ?? undefined,
      event: this.form.get("eventId")?.value
        ? String(this.form.get("eventId")?.value)
        : undefined,
    };

    this.testimonyService
      .updateTestimony(this.testimony()!.id, data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notification.success("Testimonio actualizado");
          this.router.navigate(["/my-testimonies"]);
          this.submitting.set(false);
        },
        error: () => {
          this.notification.error("Error al actualizar el testimonio");
          this.submitting.set(false);
        },
      });
  }

  cancel() {
    this.router.navigate(["/my-testimonies"]);
  }
}
