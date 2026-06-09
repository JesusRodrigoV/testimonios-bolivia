import { NgClass, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { NotificationService } from '@app/core/services/notification.service';
import { User } from "@app/features/auth/models/user.model";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService } from "../services";
import { UserDialogComponent } from "./user-dialog";
import { ConfirmDialogComponent } from "@app/features/forum/components/confirm-dialog/confirm-dialog.component";
import { MatButtonModule } from "@angular/material/button";
import { SpinnerComponent } from "@app/features/shared/ui/spinner";

@Component({
  selector: "app-user-management",
  imports: [NgOptimizedImage, NgClass, MatButtonModule, SpinnerComponent],
  templateUrl: "./user-management.component.html",
  styleUrl: "./user-management.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  isLoading = signal(false);

  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.loadUsers();
  }

  getRoleName(roleId: number): string {
    const roles = {
      1: "Administrador",
      2: "Curador",
      3: "Investigador",
      4: "Visitante",
    };
    return roles[roleId as keyof typeof roles] || "Desconocido";
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.adminService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (users) => {
        this.users = users.map((u) => ({
          ...u,
          id: u.id_usuario,
        }));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.error("Error al cargar usuarios");
      },
    });
  }

  openUserDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: "400px",
      data: user || {},
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          if (result.id_usuario) {
            this.adminService
              .updateUser(result.id_usuario, result)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: () => {
                  this.loadUsers();
                  this.notification.success(
                    "Usuario actualizado con éxito",
                  );
                },
                error: () => {
                  this.notification.error("Error al actualizar usuario");
                },
              });
          } else {
            this.adminService
              .createUser(result)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: () => {
                  this.loadUsers();
                  this.notification.success("Usuario creado con éxito");
                },
                error: () => {
                  this.notification.error("Error al crear usuario");
                },
              });
          }
        }
      });
  }

  deleteUser(id: number): void {
    if (!id) {
      this.notification.error("Error: ID de usuario inválido");
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: "¿Estás seguro de que querés eliminar este usuario?",
        confirmButtonText: "Eliminar",
        confirmColor: "warn",
      },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (!result) return;
      this.isLoading.set(true);

      this.adminService
        .deleteUser(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadUsers();
            this.notification.success("Usuario eliminado con éxito");
            this.isLoading.set(false);
          },
          error: (error) => {
            this.notification.error(
              error.error?.message || "Error al eliminar usuario",
            );
            this.isLoading.set(false);
          },
        });
    });
  }
}
