import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from "@angular/core";
import { ForumService } from "../../services";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {
  DatePipe,
  Location,
  NgOptimizedImage,
} from "@angular/common";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ForumCommentComponent } from "../forum-comment";
import { ForoComentario, ForoTema } from "../../models";
import { SpinnerComponent } from "@app/features/shared/ui/spinner";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { NotificationService } from '@app/core/services/notification.service';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatDialog } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AuthStore } from "@app/auth.store";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";

@Component({
  selector: "app-forum-post-detail",
  imports: [
    DatePipe,
    ForumCommentComponent,
    SpinnerComponent,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    NgOptimizedImage,
    MatTooltipModule,
    RouterLink,
  ],
  templateUrl: "./forum-post-detail.component.html",
  styleUrl: "./forum-post-detail.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ForumPostDetailComponent {
  private location = inject(Location);
  private forumService = inject(ForumService);
  private activatedRoute = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private authStore = inject(AuthStore);
  private destroyRef = inject(DestroyRef);

  id = this.activatedRoute.snapshot.paramMap.get('id')!;
  forumPost: ForoTema | null = null;
  forumComments: ForoComentario[] = [];
  isLoadingComments = signal(true);
  isLoadingPost = signal(true);
  commentForm: FormGroup;
  isSubmitting = signal(false);
  commentError = signal<string | null>(null);
  commentPage = 1;
  totalComments = 0;
  hasMoreComments = false;
  commentSort = signal<'newest' | 'oldest'>('newest');
  currentUserId = this.authStore.user()?.id_usuario;
  currentUserRole = this.authStore.user()?.role;

  constructor() {
    this.commentForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.maxLength(500)]],
    });
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.forumService.getTopicById(Number(this.id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.forumPost = data;
          this.isLoadingPost.set(false);
        },
        error: () => {
          this.forumPost = null;
          this.isLoadingPost.set(false);
          this.notification.error('Error al cargar el tema');
        },
      });
    this.cargarComentarios();
  }

  cargarComentarios(append = false): void {
    if (!append) {
      this.isLoadingComments.set(true);
      this.commentPage = 1;
    }

    this.forumService.getCommentsByTopicId(Number(this.id), this.commentPage, 10, this.commentSort())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.forumComments = append
            ? [...this.forumComments, ...response.data]
            : response.data;
          this.totalComments = response.meta.total;
          this.hasMoreComments = this.commentPage < response.meta.totalPages;
          this.isLoadingComments.set(false);
        },
        error: () => {
          this.forumComments = [];
          this.isLoadingComments.set(false);
          this.notification.error('Error al cargar comentarios');
        },
      });
  }

  loadMoreComments(): void {
    this.commentPage++;
    this.cargarComentarios(true);
  }

  goBack(): void {
    this.location.back();
  }

  setCommentSort(sort: 'newest' | 'oldest'): void {
    this.commentSort.set(sort);
    this.cargarComentarios();
  }

  onSubmitComment(): void {
    if (this.commentForm.invalid) {
      this.commentError.set('El comentario es requerido');
      return;
    }

    this.isSubmitting.set(true);
    this.commentError.set(null);

    const commentData = {
      contenido: this.commentForm.value.contenido,
      id_forotema: Number(this.id),
    };

    this.forumService.createComment(commentData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newComment) => {
          this.isSubmitting.set(false);
          this.commentForm.reset();
          this.forumComments = [{ ...newComment, children: [] }, ...this.forumComments];
          this.totalComments++;
          this.notification.success('Comentario añadido');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.commentError.set(err.message || 'Error al añadir el comentario');
          this.notification.error(this.commentError() || 'Error desconocido');
        },
      });
  }

  onReplySubmitted({ parentId, newReply }: { parentId: number; newReply: ForoComentario }): void {
    this.forumComments = this.addReplyToComments(this.forumComments, parentId, {
      ...newReply, children: [],
    });
  }

  onCommentDeleted(commentId: number): void {
    this.forumComments = this.removeCommentFromTree(this.forumComments, commentId);
    this.totalComments--;
  }

  onTopicDeleted(): void {
    this.notification.success('Tema eliminado');
    this.goBack();
  }

  onDeleteTopic(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Eliminar este tema? Los comentarios también se eliminarán.' },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (confirmed) {
        this.forumService.deleteTopic(Number(this.id))
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.onTopicDeleted(),
            error: () => this.notification.error('Error al eliminar el tema'),
          });
      }
    });
  }

  private addReplyToComments(
    comments: ForoComentario[],
    parentId: number,
    newReply: ForoComentario,
  ): ForoComentario[] {
    return comments.map((comment) => {
      if (comment.id_forocoment === parentId) {
        return { ...comment, children: [...comment.children, newReply] };
      }
      if (comment.children.length > 0) {
        return {
          ...comment,
          children: this.addReplyToComments(comment.children, parentId, newReply),
        };
      }
      return comment;
    });
  }

  private removeCommentFromTree(comments: ForoComentario[], commentId: number): ForoComentario[] {
    return comments
      .filter((c) => c.id_forocoment !== commentId)
      .map((c) => ({
        ...c,
        children: c.children.length > 0 ? this.removeCommentFromTree(c.children, commentId) : c.children,
      }));
  }
}
