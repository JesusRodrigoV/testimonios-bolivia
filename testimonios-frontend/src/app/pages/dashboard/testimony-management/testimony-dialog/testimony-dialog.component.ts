import { DatePipe, TitleCasePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from "@angular/material/button";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { NotificationService } from '@app/core/services/notification.service';
import { VideoPlayerComponent } from "@app/features/shared/video-player";
import { MediaFormat } from "@app/features/testimony/models/media-format";
import { Testimony } from "@app/features/testimony/models/testimonio.model";
import { StatusEnum } from "@app/features/testimony/models/status.enum";
import { TestimonioService } from "@app/features/testimony/services";
import { ConfirmDialogComponent } from "@app/features/forum/components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-testimony-dialog",
  imports: [DatePipe, TitleCasePipe, MatButtonModule, VideoPlayerComponent],
  templateUrl: "./testimony-dialog.component.html",
  styleUrl: "./testimony-dialog.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonyDialogComponent {
  readonly StatusEnum = StatusEnum;
  readonly MediaFormat = MediaFormat;
  readonly dialogRef = inject(MatDialogRef<TestimonyDialogComponent>);
  readonly testimony = inject<Testimony>(MAT_DIALOG_DATA);
  private testimonioService = inject(TestimonioService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  approve(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `¿Estás seguro de que querés aprobar "${this.testimony.title}"?`,
        confirmButtonText: "Aprobar",
        confirmColor: "primary" as const,
      },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (!result) return;
      this.testimonioService.validateTestimony(this.testimony.id, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.notification.success("Testimonio aprobado con éxito");
          this.dialogRef.close({ approved: true });
        },
        error: () => {
          this.notification.error("Error al aprobar testimonio");
        },
      });
    });
  }

  reject(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `¿Estás seguro de que querés rechazar "${this.testimony.title}"?`,
        confirmButtonText: "Rechazar",
        confirmColor: "warn" as const,
      },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (!result) return;
      this.testimonioService.validateTestimony(this.testimony.id, false).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.notification.success("Testimonio rechazado con éxito");
          this.dialogRef.close({ approved: true });
        },
        error: () => {
          this.notification.error("Error al rechazar testimonio");
        },
      });
    });
  }
}
