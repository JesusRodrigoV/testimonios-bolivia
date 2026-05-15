import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, input, OnChanges, output } from '@angular/core';
import { SpinnerComponent } from '@app/features/shared/ui/spinner';
import { CommentItemComponent } from './comment-item';
import { Comment } from '@app/features/testimony/models/comment.model';
import { NotificationService } from '@app/core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthStore } from '@app/auth.store';
import { CommentService } from '@app/features/testimony/services';
import { CommentFormComponent } from '../comment-form';
import { MatIconModule } from '@angular/material/icon';
import { NgStyle } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmDialogComponent } from '@app/features/forum/components/confirm-dialog/confirm-dialog.component';

const ADMIN_ROLE = 1;

// Exported for template access

@Component({
  selector: 'app-comment-list',
  imports: [SpinnerComponent, CommentItemComponent, CommentFormComponent, MatIconModule, NgStyle, MatButtonModule],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentListComponent implements OnChanges {
  comments = input.required<Comment[]>();
  isLoading = input<boolean>(false);
  testimonyId = input.required<number>();
  commentsUpdated = output<void>();

  replyingTo: number | null = null;
  editingId: number | null = null;
  expandedReplies: { [key: number]: boolean } = {};
  flattenedComments: (Comment & { depth: number })[] = [];
  readonly adminRole = ADMIN_ROLE;
  private MAX_INDENT_DEPTH = 6;

  private authStore = inject(AuthStore);
  private commentService = inject(CommentService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private ref = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  get isAuthenticated(): boolean {
    return this.authStore.isAuthenticated();
  }

  get currentUserId(): number | undefined {
    return this.authStore.user()?.id_usuario;
  }

  get currentUserRole(): number | undefined {
    return this.authStore.user()?.role;
  }

  isAdmin(role?: number): boolean {
    return role === ADMIN_ROLE;
  }

  isCommentAuthor(comment: Comment): boolean {
    return comment.creado_por_id_usuario === this.currentUserId;
  }

  canDelete(comment: Comment): boolean {
    return this.isCommentAuthor(comment) || this.currentUserRole === ADMIN_ROLE;
  }

  canEdit(comment: Comment): boolean {
    return this.isCommentAuthor(comment);
  }

  ngOnChanges() {
    this.flattenedComments = this.flattenComments(this.comments());
  }

  private flattenComments(comments: Comment[], depth: number = 0): (Comment & { depth: number })[] {
    const result: (Comment & { depth: number })[] = [];
    const cappedDepth = Math.min(depth, this.MAX_INDENT_DEPTH);
    for (const comment of comments) {
      result.push({ ...comment, depth: cappedDepth, replies: comment.replies || [] });
      if (this.expandedReplies[comment.id_comentario] && comment.replies?.length > 0) {
        result.push(...this.flattenComments(comment.replies, depth + 1));
      }
    }
    return result;
  }

  startReply(commentId: number) {
    if (!this.isAuthenticated) {
      this.notification.error('Inicia sesión para responder');
      return;
    }
    this.editingId = null;
    this.replyingTo = commentId;
  }

  cancelReply() {
    this.replyingTo = null;
  }

  onReplySubmitted(newComment: Comment) {
    this.replyingTo = null;

    const comments = this.comments();
    this.addReplyToTree(comments, newComment.parent_id!, newComment);

    this.expandedReplies[newComment.parent_id!] = true;
    this.flattenedComments = this.flattenComments(comments);
    this.commentsUpdated.emit();
    this.ref.markForCheck();
  }

  private addReplyToTree(comments: Comment[], parentId: number, newComment: Comment): boolean {
    for (const c of comments) {
      if (c.id_comentario === parentId) {
        c.replies = [...(c.replies || []), newComment];
        return true;
      }
      if (c.replies?.length && this.addReplyToTree(c.replies, parentId, newComment)) {
        return true;
      }
    }
    return false;
  }

  toggleReplies(commentId: number) {
    this.expandedReplies[commentId] = !this.expandedReplies[commentId];
    this.flattenedComments = this.flattenComments(this.comments());
  }

  toggleLike(commentId: number) {
    if (!this.isAuthenticated) {
      this.notification.error('Inicia sesión para dar me gusta');
      return;
    }
    const comment = this.flattenedComments.find(c => c.id_comentario === commentId);
    if (!comment) return;

    const action = comment.isLiked
      ? this.commentService.unlikeComment(commentId)
      : this.commentService.likeComment(commentId);

    action.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        comment.isLiked = !comment.isLiked;
        comment.likeCount! += comment.isLiked ? 1 : -1;
        this.flattenedComments = [...this.flattenedComments];
        this.ref.markForCheck();
      },
      error: () => {
        this.notification.error('Error al actualizar me gusta');
      },
    });
  }

  startEdit(comment: Comment) {
    this.replyingTo = null;
    this.editingId = comment.id_comentario;
  }

  cancelEdit() {
    this.editingId = null;
  }

  onEditSubmitted(updated: Comment) {
    const flat = this.flattenedComments.find(c => c.id_comentario === updated.id_comentario);
    if (flat) flat.contenido = updated.contenido;
    this.flattenedComments = [...this.flattenedComments];
    this.editingId = null;
    this.ref.markForCheck();
  }

  private removeCommentFromTree(comments: Comment[], commentId: number): boolean {
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].id_comentario === commentId) {
        comments.splice(i, 1);
        return true;
      }
      if (comments[i].replies?.length) {
        const found = this.removeCommentFromTree(comments[i].replies, commentId);
        if (found) return true;
      }
    }
    return false;
  }

  deleteComment(commentId: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Estás seguro de eliminar este comentario?' },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result => {
      if (!result) return;
      this.commentService.deleteComment(commentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          const comments = this.comments();
          this.removeCommentFromTree(comments, commentId);
          this.flattenedComments = this.flattenComments(comments);
          this.commentsUpdated.emit();
          this.ref.markForCheck();
          this.notification.success('Comentario eliminado', 'Cerrar', { duration: 2000 });
        },
        error: () => {
          this.notification.error('Error al eliminar comentario');
        },
      });
    });
  }
}
