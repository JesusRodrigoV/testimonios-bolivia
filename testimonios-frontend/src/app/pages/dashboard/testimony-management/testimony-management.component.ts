import { NgClass, TitleCasePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { NotificationService } from '@app/core/services/notification.service';
import { Testimony } from "@app/features/testimony/models/testimonio.model";
import { StatusEnum } from "@app/features/testimony/models/status.enum";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestimonioService } from "@app/features/testimony/services";
import { TestimonyDialogComponent } from "./testimony-dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { SpinnerComponent } from "@app/features/shared/ui/spinner";
import { ConfirmDialogComponent } from "@app/features/forum/components/confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-testimony-management",
  imports: [NgClass, TitleCasePipe, MatButtonModule, MatIconModule, MatTooltipModule, SpinnerComponent],
  templateUrl: "./testimony-management.component.html",
  styleUrl: "./testimony-management.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonyManagementComponent implements OnInit {
  readonly StatusEnum = StatusEnum;
  testimonies: Testimony[] = [];
  isLoading = false;
  selectedStatus = signal<string>('');
  page = signal(1);
  limit = 10;
  total = signal(0);
  hasMore = signal(false);
  cursor = signal<string | null>(null);
  readonly Math = Math;

  private testimonioService = inject(TestimonioService);
  private dialog = inject(MatDialog);
  private notification = inject(NotificationService);
  private ref = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  statusFilters = [
    { value: '', label: 'Todos' },
    { value: StatusEnum.PENDIENTE, label: 'Pendientes' },
    { value: StatusEnum.APROBADO, label: 'Aprobados' },
    { value: StatusEnum.RECHAZADO, label: 'Rechazados' },
  ];

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['status']) {
        this.selectedStatus.set(params['status']);
      }
    });
    this.loadTestimonies();
  }

  setFilter(status: string) {
    this.selectedStatus.set(status);
    this.page.set(1);
    this.cursor.set(null);
    this.loadTestimonies();
  }

  loadTestimonies(): void {
    this.isLoading = true;
    const params: { status?: string; limit: number; page: number } = {
      limit: this.limit,
      page: this.page(),
    };
    if (this.selectedStatus()) {
      params.status = this.selectedStatus();
    }
    this.testimonioService.searchTestimonies(params).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.testimonies = response.data;
        this.total.set(response.pagination.total);
        this.hasMore.set(response.pagination.hasMore);
        this.cursor.set(response.pagination.cursor);
        this.isLoading = false;
        this.ref.markForCheck();
      },
      error: () => {
        this.notification.error("Error al cargar testimonios");
        this.isLoading = false;
        this.ref.markForCheck();
      },
    });
  }

  goToPage(p: number) {
    if (p < 1) return;
    this.page.set(p);
    this.loadTestimonies();
  }

  get totalPages() {
    return Math.ceil(this.total() / this.limit);
  }

  get pages(): number[] {
    const current = this.page();
    const total = this.totalPages;
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  refreshTestimonies(): void {
    this.loadTestimonies();
  }

  openTestimonyDialog(testimony: Testimony): void {
    const dialogRef = this.dialog.open(TestimonyDialogComponent, {
      width: "600px",
      data: testimony,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result) {
        this.loadTestimonies();
      }
    });
  }

  validateTestimony(id: number, approve: boolean): void {
    const action = approve ? "aprobar" : "rechazar";
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: `¿Estás seguro de que querés ${action} este testimonio?`,
        confirmButtonText: approve ? "Aprobar" : "Rechazar",
        confirmColor: approve ? ("primary" as const) : ("warn" as const),
      },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (!result) return;
      this.isLoading = true;
      this.testimonioService
        .validateTestimony(id, approve)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadTestimonies();
            this.notification.success(
              `Testimonio ${approve ? "aprobado" : "rechazado"} con éxito`,
            );
            this.isLoading = false;
            this.ref.markForCheck();
          },
          error: () => {
            this.notification.error("Error al validar testimonio");
            this.isLoading = false;
            this.ref.markForCheck();
          },
        });
    });
  }

  deleteTestimony(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: "¿Estás seguro de que querés eliminar este testimonio?",
        confirmButtonText: "Eliminar",
        confirmColor: "warn" as const,
      },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (!result) return;
      this.isLoading = true;
      this.testimonioService
        .deleteTestimony(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.loadTestimonies();
            this.notification.success("Testimonio eliminado con éxito");
            this.isLoading = false;
            this.ref.markForCheck();
          },
          error: () => {
            this.notification.error("Error al eliminar testimonio");
            this.isLoading = false;
            this.ref.markForCheck();
          },
        });
    });
  }
}
