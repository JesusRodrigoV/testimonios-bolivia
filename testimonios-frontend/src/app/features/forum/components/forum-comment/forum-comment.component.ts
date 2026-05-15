import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { ForoComentario } from '../../models';
import { AuthStore } from '@app/auth.store';
import { DatePipe, NgClass, NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SpinnerComponent } from '@app/features/shared/ui/spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NotificationService } from '@app/core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ForumService } from '../../services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-forum-comment',
  imports: [
    NgClass, NgOptimizedImage, DatePipe, MatIconModule, MatButtonModule,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    SpinnerComponent, TitleCasePipe, MatTooltipModule,
  ],
  templateUrl: './forum-comment.component.html',
  styleUrl: './forum-comment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForumCommentComponent {
  private authStore = inject(AuthStore);
  private forumService = inject(ForumService);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  comentario = input.required<ForoComentario>();
  isReply = input<boolean>(false);
  topicId = input<string | null>(null);
  replySubmitted = output<{ parentId: number; newReply: ForoComentario }>();
  commentDeleted = output<number>();

  currentUserId = this.authStore.user()?.id_usuario;
  currentUserRole = this.authStore.user()?.role;
  replyForm: FormGroup;
  editForm: FormGroup;
  isSubmittingReply = signal(false);
  replyError = signal<string | null>(null);
  replyingTo = signal<number | null>(null);
  isDeleting = signal(false);
  isEditing = signal(false);
  isSubmittingEdit = signal(false);
  editError = signal<string | null>(null);

  constructor() {
    this.replyForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.maxLength(500)]],
    });
    this.editForm = this.fb.group({
      contenido: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  getRoleClass(role: string): string {
    return role.toLowerCase();
  }

  startReply(): void {
    this.replyingTo.set(this.comentario().id_forocoment);
    this.replyForm.reset();
    this.replyError.set(null);
  }

  cancelReply(): void {
    this.replyingTo.set(null);
    this.replyError.set(null);
    this.replyForm.reset();
  }

  onSubmitReply(): void {
    if (this.replyForm.invalid) {
      this.replyError.set('La respuesta es requerida');
      return;
    }

    if (!this.topicId()) return;

    this.isSubmittingReply.set(true);
    this.replyError.set(null);

    const replyData = {
      contenido: this.replyForm.value.contenido,
      id_forotema: Number(this.topicId()),
      parent_id: this.comentario().id_forocoment,
    };

    this.forumService.createComment(replyData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (newReply) => {
          this.isSubmittingReply.set(false);
          this.replyForm.reset();
          this.replyingTo.set(null);
          this.replySubmitted.emit({
            parentId: this.comentario().id_forocoment,
            newReply: { ...newReply, children: [] },
          });
          this.notification.success('Respuesta añadida');
        },
        error: (err) => {
          this.isSubmittingReply.set(false);
          this.replyError.set(err.message || 'Error al añadir la respuesta');
          this.notification.error(this.replyError() || 'Error desconocido');
        },
      });
  }

  startEdit(): void {
    this.editForm.setValue({ contenido: this.comentario().contenido });
    this.isEditing.set(true);
    this.editError.set(null);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editError.set(null);
  }

  onSubmitEdit(): void {
    if (this.editForm.invalid) {
      this.editError.set('El contenido es requerido');
      return;
    }

    this.isSubmittingEdit.set(true);
    this.editError.set(null);

    this.forumService.updateComment(this.comentario().id_forocoment, {
      contenido: this.editForm.value.contenido,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.isSubmittingEdit.set(false);
          this.isEditing.set(false);
          this.notification.success('Comentario actualizado');
        },
        error: (err) => {
          this.isSubmittingEdit.set(false);
          this.editError.set(err.message || 'Error al actualizar');
          this.notification.error(this.editError() || 'Error desconocido');
        },
      });
  }

  onDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: '¿Eliminar este comentario? Las respuestas también se eliminarán.' },
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (confirmed) {
        this.isDeleting.set(true);
        this.forumService.deleteComment(this.comentario().id_forocoment)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.isDeleting.set(false);
              this.commentDeleted.emit(this.comentario().id_forocoment);
              this.notification.success('Comentario eliminado');
            },
            error: () => {
              this.isDeleting.set(false);
              this.notification.error('Error al eliminar el comentario');
            },
          });
      }
    });
  }
}
