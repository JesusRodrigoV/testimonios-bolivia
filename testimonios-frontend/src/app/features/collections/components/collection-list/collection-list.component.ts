import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { Router } from "@angular/router";
import { Collection } from "../../models/collection.model";
import { AuthStore } from "@app/auth.store";
import { CollectionService } from "../../services";
import { NotificationService } from '@app/core/services/notification.service';
import { SpinnerComponent } from "@app/features/shared/ui/spinner";
import { DatePipe } from "@angular/common";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmDialogComponent } from "@app/features/forum/components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-collection-list",
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    SpinnerComponent,
    ReactiveFormsModule,
    DatePipe,
  ],
  templateUrl: "./collection-list.component.html",
  styleUrl: "./collection-list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CollectionListComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly collectionService = inject(CollectionService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  collections = signal<Collection[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  saving = signal(false);
  collectionForm: FormGroup;
  dialogRef?: MatDialogRef<any>;
  isAuthenticated = this.authStore.isAuthenticated;
  editingCollection: Collection | null = null;

  formTemplate = viewChild.required<TemplateRef<any>>('formTemplate');

  constructor() {
    this.collectionForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
    });
  }

  ngOnInit() {
    this.loadCollections();
  }

  loadCollections() {
    if (!this.isAuthenticated()) {
      this.error.set('Debes iniciar sesión para ver tus colecciones');
      return;
    }
    this.loading.set(true);
    this.collectionService.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (collections) => {
        this.collections.set(collections);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las colecciones');
        this.loading.set(false);
      },
    });
  }

  openCollectionForm(collection?: Collection) {
    if (!this.isAuthenticated()) {
      this.notification.error('Debes iniciar sesión para crear/editar colecciones');
      return;
    }
    this.editingCollection = collection || null; // Set the editing collection
    if (collection) {
      this.collectionForm.patchValue({
        titulo: collection.titulo,
        descripcion: collection.descripcion,
      });
    } else {
      this.collectionForm.reset();
    }

    this.dialogRef = this.dialog.open(this.formTemplate(), {
      data: { collection }, // Still pass for template rendering
      width: '500px',
    });
  }

  closeCollectionForm() {
    this.dialogRef?.close();
    this.editingCollection = null; // Clear editing state
    this.collectionForm.reset();
  }

  saveCollection() {
    if (this.collectionForm.invalid || !this.isAuthenticated()) return;

    this.saving.set(true);
    const collectionData = this.editingCollection
      ? this.collectionForm.value
      : {
          ...this.collectionForm.value,
          id_usuario: this.authStore.user()?.id_usuario,
          fecha_creacion: new Date().toISOString(),
        };

    if (this.editingCollection) {
      // Update existing collection
      this.collectionService.update(this.editingCollection.id_coleccion, collectionData)      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.loadCollections();
          this.notification.success('Colección actualizada');
          this.closeCollectionForm();
          this.saving.set(false);
        },
        error: () => {
          this.notification.error('Error al actualizar la colección');
          this.saving.set(false);
        },
      });
    } else {
      // Create new collection
      this.collectionService.create(collectionData)      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.loadCollections();
          this.notification.success('Colección creada');
          this.closeCollectionForm();
          this.saving.set(false);
        },
        error: () => {
          this.notification.error('Error al crear la colección');
          this.saving.set(false);
        },
      });
    }
  }

  deleteCollection(id: number) {
    if (!this.isAuthenticated()) {
      this.notification.error('Debes iniciar sesión para eliminar colecciones');
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de eliminar esta colección?' },
    });
    dialogRef.afterClosed()      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (!confirmed) return;
      this.collectionService.delete(id)      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.loadCollections();
          this.notification.success('Colección eliminada');
        },
        error: () => this.notification.error('Error al eliminar la colección'),
      });
    });
  }

  navigateToCollection(id: number) {
    this.router.navigate(['/collections', id]);
  }

  isProtectedCollection(collection: Collection): boolean {
    return collection.titulo === 'Favoritos' || collection.titulo === 'Guardados';
  }
}