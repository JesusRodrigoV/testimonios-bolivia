import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '@app/core/services/notification.service';
import { AuthStore } from '@app/auth.store';
import { CommentService } from '@app/features/testimony/services';
import { Comment } from '@app/features/testimony/models/comment.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-comment-form',
  imports: [FormsModule, MatButtonModule],
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentFormComponent implements OnInit {
  formType = input<'comment' | 'reply' | 'edit'>('comment');
  testimonyId = input.required<number>();
  parentId = input<number>();
  commentId = input<number>();
  initialContent = input<string>('');
  commentSubmitted = output<Comment>();
  editSubmitted = output<Comment>();
  editCancelled = output<void>();
  cancelled = output<void>();

  content = '';
  formErrors: { [key: string]: boolean } = {};

  private ref = inject(ChangeDetectorRef);
  private commentService = inject(CommentService);
  private notification = inject(NotificationService);
  readonly authStore = inject(AuthStore);
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    if (this.formType() === 'edit') {
      this.content = this.initialContent();
    }
  }

  submit() {
    if (!this.authStore.isAuthenticated()) {
      this.notification.error('Inicia sesión para comentar');
      return;
    }
    if (this.content.length < 2) {
      this.formErrors['content'] = true;
      this.ref.markForCheck();
      return;
    }
    this.formErrors['content'] = false;

    if (this.formType() === 'edit') {
      this.commentService.updateComment(this.commentId()!, { contenido: this.content })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated) => {
            this.content = '';
            this.editSubmitted.emit(updated);
            this.notification.success('Comentario actualizado', 'Cerrar', { duration: 2000 });
          },
          error: () => {
            this.notification.error('Error al actualizar comentario');
            this.ref.markForCheck();
          },
        });
      return;
    }

    this.commentService
      .createComment({
        contenido: this.content,
        id_testimonio: this.testimonyId(),
        parent_id: this.parentId(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newComment) => {
          this.content = '';
          this.commentSubmitted.emit(newComment);
          this.notification.success(
            `${this.formType() === 'comment' ? 'Comentario' : 'Respuesta'} enviada. Será visible después de la aprobación.`,
          );
        },
        error: () => {
          this.notification.error(`Error al crear ${this.formType() === 'comment' ? 'comentario' : 'respuesta'}`);
          this.ref.markForCheck();
        },
      });
  }

  cancel() {
    this.content = '';
    this.formErrors['content'] = false;
    if (this.formType() === 'edit') {
      this.editCancelled.emit();
    } else {
      this.cancelled.emit();
    }
    this.ref.markForCheck();
  }
}
