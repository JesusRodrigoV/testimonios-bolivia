import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '@app/core/services/notification.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { Testimony } from '@app/features/testimony/models/testimonio.model';
import { TestimonioService } from '@app/features/testimony/services';
import { ForumService } from '../../services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-forum-topic-form',
  imports: [
    ReactiveFormsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    MatIconModule, RouterLink, DatePipe,
  ],
  templateUrl: './forum-topic-form.component.html',
  styleUrl: './forum-topic-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ForumTopicFormComponent {
  topicForm: FormGroup;
  isSubmitting = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');
  testimonios: Testimony[] = [];
  events: { id: number; name: string; description: string; date: string }[] = [];
  topicId = signal<number | null>(null);
  isEditMode = computed(() => this.topicId() !== null);
  cancelLink = computed(() => this.isEditMode() ? ['/forum/post', this.topicId()] : ['/forum']);

  private forumService = inject(ForumService);
  private testimonioService = inject(TestimonioService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.topicId.set(Number(idParam));
    }

    this.topicForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.required],
      id_testimonio: [null],
      id_evento: [null],
    });
  }

  ngOnInit(): void {
    if (this.isEditMode()) {
      if (isNaN(this.topicId()!)) {
        this.notification.error('ID de tema inválido');
        this.router.navigate(['/forum']);
        return;
      }
      this.loadEditData();
    } else {
      this.loadCreateData();
    }
  }

  private loadEditData(): void {
    this.isLoading.set(true);
    forkJoin({
      topic: this.forumService.getTopicById(this.topicId()!),
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
          this.isLoading.set(false);
        },
        error: () => {
          this.notification.error('Error al cargar el tema');
          this.isLoading.set(false);
          this.router.navigate(['/forum']);
        },
      });
  }

  private loadCreateData(): void {
    forkJoin({
      testimonios: this.testimonioService.getAll(),
      events: this.forumService.getEvents(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.testimonios = result.testimonios;
          this.events = result.events;
        },
        error: () => {
          this.notification.error('Error al cargar datos');
        },
      });
  }

  onSubmit(): void {
    if (this.topicForm.invalid) return;
    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.topicForm.value;

    if (!this.isEditMode()) {
      if (!formValue['id_testimonio'] && !formValue['id_evento']) {
        this.errorMessage.set('Debe vincular al menos un testimonio o un evento histórico');
        this.isSubmitting.set(false);
        return;
      }
    }

    const topicData: { titulo: string; descripcion: string; id_evento?: number; id_testimonio?: number } = {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
    };

    if (!this.isEditMode()) {
      if (formValue['id_testimonio']) topicData.id_testimonio = formValue['id_testimonio'];
      if (formValue['id_evento']) topicData.id_evento = formValue['id_evento'];

      this.forumService.createTopic(topicData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.notification.success('Tema creado exitosamente');
            this.router.navigate(['/forum']);
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(err.message || 'Error al crear el tema');
            this.notification.error(this.errorMessage());
          },
        });
    } else {
      this.forumService.updateTopic(this.topicId()!, topicData)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.notification.success('Tema actualizado exitosamente');
            this.router.navigate(['/forum/post', this.topicId()]);
          },
          error: (err) => {
            this.isSubmitting.set(false);
            this.errorMessage.set(err.message || 'Error al actualizar el tema');
            this.notification.error(this.errorMessage());
          },
        });
    }
  }
}
