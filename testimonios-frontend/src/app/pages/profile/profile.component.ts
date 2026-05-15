import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatDividerModule } from "@angular/material/divider";
import { AuthStore } from "@app/auth.store";
import { FavoritesStore } from "@app/stores/favorites.store";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NotificationService } from '@app/core/services/notification.service';
import { MatTooltipModule } from "@angular/material/tooltip";
import { UserService } from "./services/user.service";
import { User } from "@app/features/auth/models/user.model";
import { firstValueFrom } from "rxjs";
import { SpinnerComponent } from "@app/features/shared/ui/spinner";
import { Router } from "@angular/router";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmDialogComponent } from "@app/features/forum/components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-profile",
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    SpinnerComponent,
    MatDialogModule,
  ],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileComponent {
  private authStore = inject(AuthStore);
  private favoritesStore = inject(FavoritesStore);
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  user = this.authStore.user;
  loading = this.authStore.loading;
  profileForm: FormGroup;
  isSaving = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  constructor() {
    this.profileForm = this.fb.group({
      nombre: [
        { value: this.user()?.nombre || '', disabled: true },
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ],
      ],
      biografia: [{ value: this.user()?.biografia || '', disabled: true }],
    });
  }

  getRoleName(roleId: number | undefined): string {
    switch (roleId) {
      case 1: return 'Administrador';
      case 2: return 'Curador';
      case 3: return 'Investigador';
      case 4: return 'Visitante';
      default: return 'Desconocido';
    }
  }

  startEdit() {
    this.isEditing.set(true);
    this.profileForm.enable();
    this.imagePreview.set(null);
    this.selectedFile = null;
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.profileForm.disable();
    this.resetForm();
  }

  async onLogout() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: '¿Estás seguro de que querés cerrar sesión?',
        confirmButtonText: 'Cerrar sesión',
        confirmColor: 'warn',
      },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async (result) => {
      if (!result) return;
      this.isSaving.set(true);
      try {
        this.favoritesStore.reset();
        await this.authStore.logout();
        this.notification.success('Sesión cerrada exitosamente');
      } catch {
        this.notification.error('Error al cerrar sesión');
      } finally {
        this.isSaving.set(false);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.openSnackBar('Solo se permiten imágenes JPEG o PNG', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.openSnackBar('La imagen no debe exceder 5MB', 'error');
      return;
    }

    if (this.imagePreview()) {
      URL.revokeObjectURL(this.imagePreview()!);
    }
    this.selectedFile = file;
    this.imagePreview.set(URL.createObjectURL(file));
  }

  async onSubmit() {
    if (!this.profileForm.valid) return;

    this.isSaving.set(true);
    try {
      const userId = this.user()?.id_usuario;
      if (!userId) throw new Error('Usuario no autenticado');

      let profileImageUrl: string | undefined;
      if (this.selectedFile) {
        const uploadResult = await firstValueFrom(this.userService.uploadProfileImage(this.selectedFile));
        profileImageUrl = uploadResult.secure_url;
      }

      const updateData: Partial<User> = {
        nombre: this.profileForm.get('nombre')?.value,
        biografia: this.profileForm.get('biografia')?.value || '',
        ...(profileImageUrl && { profile_image: profileImageUrl }),
      };

      const updatedUser = await firstValueFrom(this.userService.updateUser(userId, updateData));
      if (updatedUser) {
        this.authStore.loadUserProfile();
        this.isEditing.set(false);
        this.profileForm.disable();
        this.imagePreview.set(null);
        this.selectedFile = null;
        this.openSnackBar('Perfil actualizado exitosamente', 'success');
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (error: any) {
      this.openSnackBar(error.message || 'Error al actualizar el perfil', 'error');
    } finally {
      this.isSaving.set(false);
    }
  }

  resetForm() {
    this.profileForm.reset({
      nombre: this.user()?.nombre || '',
      biografia: this.user()?.biografia || '',
    });
    if (this.imagePreview()) {
      URL.revokeObjectURL(this.imagePreview()!);
    }
    this.imagePreview.set(null);
    this.selectedFile = null;
  }

  openSnackBar(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      this.notification.success(message);
    } else {
      this.notification.error(message);
    }
  }
}
