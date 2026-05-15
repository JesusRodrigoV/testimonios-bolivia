import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { NotificationService } from '@app/core/services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminService, HistoricalEvent } from "../services";
import { EventDialogComponent } from "./event-dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SpinnerComponent } from "@app/features/shared/ui/spinner";
import { ConfirmDialogComponent } from "@app/features/forum/components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-event-management",
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, SpinnerComponent, DatePipe],
  templateUrl: "./event-management.component.html",
  styleUrl: "./event-management.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventManagementComponent implements OnInit {
  events: HistoricalEvent[] = [];
  isLoading = false;

  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private ref = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.adminService.getEvents().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
        this.ref.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.notification.error("Error al cargar eventos");
        this.ref.markForCheck();
      },
    });
  }

  openEventDialog(event?: HistoricalEvent): void {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: "500px",
      data: event || {},
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          if (result.id_evento) {
            this.adminService
              .updateEvent(result.id_evento, result)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: () => {
                  this.loadEvents();
                  this.notification.success(
                    "Evento actualizado con éxito",
                  );
                },
                error: () => {
                  this.notification.error("Error al actualizar evento");
                },
              });
          } else {
            this.adminService
              .createEvent(result)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: () => {
                  this.loadEvents();
                  this.notification.success("Evento creado con éxito");
                },
                error: () => {
                  this.notification.error("Error al crear evento");
                },
              });
          }
        }
      });
  }

  deleteEvent(id: number): void {
    if (!id) {
      this.notification.error("Error: ID de evento inválido");
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: "¿Estás seguro de que querés eliminar este evento?" },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (!result) return;

      this.isLoading = true;

      this.adminService
        .deleteEvent(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadEvents();
            this.notification.success("Evento eliminado con éxito");
            this.isLoading = false;
            this.ref.markForCheck();
          },
          error: (error) => {
            this.notification.error(
              error.error?.message || "Error al eliminar evento",
            );
            this.isLoading = false;
            this.ref.markForCheck();
          },
        });
    });
  }
}
