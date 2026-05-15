import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from "@angular/core";
import { NotificationService } from '@app/core/services/notification.service';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

import { Comment } from "@app/features/testimony/models/comment.model";
import { CommentService } from "@app/features/testimony/services";
import { CommentListComponent } from "./comment-list/comment-list.component";
import { CommentFormComponent } from "./comment-form";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const PAGE_SIZE = 10;
type SortOrder = 'newest' | 'oldest';

@Component({
  selector: "app-testimony-comments",
  imports: [
    CommentListComponent,
    CommentFormComponent,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: "./testimony-comments.component.html",
  styleUrl: "./testimony-comments.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonyCommentsComponent implements OnInit {
  testimonyId = input.required<number>();
  comments: Comment[] = [];
  isLoading = false;
  isLoadingMore = false;
  totalComments = 0;
  currentPage = 1;
  totalPages = 1;
  sortOrder: SortOrder = 'newest';

  private ref = inject(ChangeDetectorRef);
  private commentService = inject(CommentService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  get hasMorePages(): boolean {
    return this.currentPage < this.totalPages;
  }

  get pageSize(): number {
    return PAGE_SIZE;
  }

  ngOnInit() {
    this.loadComments();
  }

  private countReplies(comments: Comment[]): number {
    let count = comments.length;
    for (const comment of comments) {
      if (comment.replies?.length) {
        count += this.countReplies(comment.replies);
      }
    }
    return count;
  }

  toggleSort() {
    this.sortOrder = this.sortOrder === 'newest' ? 'oldest' : 'newest';
    this.sortComments();
    this.ref.markForCheck();
  }

  private sortComments() {
    const dir = this.sortOrder === 'newest' ? -1 : 1;
    this.comments.sort((a, b) => {
      const diff = new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime();
      return diff * dir;
    });
  }

  loadComments(page: number = 1) {
    const loadingSignal = page === 1 ? (v: boolean) => this.isLoading = v : (v: boolean) => this.isLoadingMore = v;
    loadingSignal(true);
    this.ref.markForCheck();

    this.commentService.getByTestimonioId(this.testimonyId(), page, PAGE_SIZE)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const mapped = response.data.map((comment) => ({
            ...comment,
            replies: comment.replies ?? [],
          }));

          if (page === 1) {
            this.comments = mapped;
          } else {
            this.comments = [...this.comments, ...mapped];
          }

          this.sortComments();
          this.totalComments = this.countReplies(this.comments);
          this.currentPage = response.meta.page;
          this.totalPages = response.meta.totalPages;
          loadingSignal(false);
          this.ref.markForCheck();
        },
        error: () => {
          loadingSignal(false);
          this.notification.error('Error al cargar comentarios');
          this.ref.markForCheck();
        },
      });
  }

  loadMore() {
    if (!this.hasMorePages || this.isLoadingMore) return;
    this.loadComments(this.currentPage + 1);
  }

  onNewComment(comment: Comment) {
    this.isLoading = false;
    this.notification.info(
      'Tu comentario fue enviado exitosamente. Esperando aprobación del administrador.',
      'Cerrar',
      { duration: 5000 },
    );
  }

  onCommentsUpdated() {
    this.totalComments = this.countReplies(this.comments);
    this.ref.markForCheck();
  }
}
