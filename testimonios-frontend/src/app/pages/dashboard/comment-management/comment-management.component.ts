import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommentService } from '@app/features/testimony/services';
import { TestimonioService } from '@app/features/testimony/services';
import { Comment } from '@app/features/testimony/models/comment.model';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgClass } from '@angular/common';
import { SpinnerComponent } from '@app/features/shared/ui/spinner';
import { MatButtonModule } from '@angular/material/button';
import { TestimonyDialogComponent } from '../testimony-management/testimony-dialog';
import { MatDialog } from '@angular/material/dialog';
import { RepliesDialogComponent } from './replies-dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmDialogComponent } from '@app/features/forum/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '@app/core/services/notification.service';

@Component({
  selector: 'app-comment-management',
  imports: [DatePipe, MatIconModule, SpinnerComponent, MatButtonModule, NgClass, MatTooltipModule],
  templateUrl: './comment-management.component.html',
  styleUrl: './comment-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentManagementComponent implements OnInit {
  comments: Comment[] = [];
  isLoading = false;
  selectedStatus = signal<string>('');
  page = signal(1);
  limit = 10;
  total = signal(0);
  totalPages = signal(1);
  readonly Math = Math;

  private ref = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private commentService = inject(CommentService);
  private testimonyService = inject(TestimonioService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  statusFilters = [
    { value: '', label: 'Todos' },
    { value: '1', label: 'Pendientes' },
    { value: '2', label: 'Aprobados' },
    { value: '3', label: 'Rechazados' },
  ];

  ngOnInit() {
    this.loadComments();
  }

  setFilter(status: string) {
    this.selectedStatus.set(status);
    this.page.set(1);
    this.loadComments();
  }

  loadComments() {
    this.isLoading = true;
    const p = this.page();
    this.commentService.getComments(p, this.limit).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.comments = response.data.sort(
          (a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
        );
        this.total.set(response.meta.total);
        this.totalPages.set(response.meta.totalPages);
        this.isLoading = false;
        this.ref.markForCheck();
      },
      error: (err) => {
        this.notification.error(
          err.status === 403
            ? 'No tienes permiso para ver los comentarios'
            : 'Error al cargar los comentarios'
        );
        this.isLoading = false;
        this.ref.markForCheck();
      },
    });
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadComments();
  }

  get pages(): number[] {
    const current = this.page();
    const total = this.totalPages();
    const pages: number[] = [];
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get filteredComments(): Comment[] {
    const status = this.selectedStatus();
    if (!status) return this.comments;
    return this.comments.filter(c => c.id_estado === parseInt(status, 10));
  }

  refreshComments() {
    this.loadComments();
  }

  openTestimonyDialog(testimonyId: number): void {
    this.testimonyService.getTestimony(testimonyId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (testimony) => {
        this.dialog.open(TestimonyDialogComponent, {
          width: '600px',
          data: testimony,
        });
      },
      error: () => {
        this.notification.error('Error al cargar el testimonio');
      },
    });
  }

  openRepliesDialog(comment: Comment): void {
    this.dialog.open(RepliesDialogComponent, {
      width: '600px',
      data: { comment, replies: comment.replies },
    });
  }

  approveComment(id: number) {
    this.commentService.updateComment(id, { id_estado: 2 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notification.success('Comentario aprobado');
        this.loadComments();
      },
      error: () => {
        this.notification.error('Error al aprobar el comentario');
      },
    });
  }

  rejectComment(id: number) {
    this.commentService.updateComment(id, { id_estado: 3 }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notification.success('Comentario rechazado');
        this.loadComments();
      },
      error: () => {
        this.notification.error('Error al rechazar el comentario');
      },
    });
  }

  deleteComment(id: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de eliminar este comentario?' },
    });
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (!confirmed) return;
      this.commentService.deleteComment(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.notification.success('Comentario eliminado');
          this.loadComments();
        },
        error: () => {
          this.notification.error('Error al eliminar el comentario');
        },
      });
    });
  }

  getRoleClass(role: string): string {
    return role.toLowerCase();
  }
}
