import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '@app/core/services/notification.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ForumService } from '../../services';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-forum-edit-topic',
  imports: [
    ReactiveFormsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    MatIconModule, RouterLink,
  ],
  templateUrl: './forum-edit-topic.component.html',
  styleUrl: './forum-edit-topic.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ForumEditTopicComponent {
  topicForm: FormGroup;
  isSubmitting = false;
  isLoading = true;
  errorMessage = '';
  topicId: number;
  events: { id: number; name: string; description: string; date: string }[] = [];

  private forumService = inject(ForumService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.topicId = Number(this.route.snapshot.paramMap.get('id'));
    this.topicForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (isNaN(this.topicId)) {
      this.notification.error('ID de tema inválido');
      this.router.navigate(['/forum']);
      return;
    }

    this.isLoading = true;
    forkJoin({
      topic: this.forumService.getTopicById(this.topicId),
      events: this.forumService.getEvents(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.topicForm.patchValue({
            titulo: result.topic.titulo,
            descripcion: result.topic.descripcion,
          });
          this.events = result.events;
          this.isLoading = false;
        },
        error: () => {
          this.notification.error('Error al cargar el tema');
          this.isLoading = false;
          this.router.navigate(['/forum']);
        },
      });
  }

  onSubmit(): void {
    if (this.topicForm.invalid) return;
    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.topicForm.value;
    const topicData: { titulo?: string; descripcion?: string; id_evento?: number; id_testimonio?: number } = {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
    };

    this.forumService.updateTopic(this.topicId, topicData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.notification.success('Tema actualizado exitosamente');
          this.router.navigate(['/forum/post', this.topicId]);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'Error al actualizar el tema';
          this.notification.error(this.errorMessage);
        },
      });
  }
}
