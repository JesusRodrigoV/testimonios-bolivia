import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { Router, RouterLink } from '@angular/router';
import { Testimony } from '@app/features/testimony/models/testimonio.model';
import { TestimonioService } from '@app/features/testimony/services';
import { ForumService } from '../../services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-forum-create-topic',
  imports: [
    ReactiveFormsModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    MatIconModule, RouterLink, DatePipe,
  ],
  templateUrl: './forum-create-topic.component.html',
  styleUrl: './forum-create-topic.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ForumCreateTopicComponent {
  topicForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  testimonios: Testimony[] = [];
  events: { id: number; name: string; description: string; date: string }[] = [];

  private forumService = inject(ForumService);
  private testimonioService = inject(TestimonioService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private notification = inject(NotificationService);

  constructor() {
    this.topicForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', Validators.required],
      id_testimonio: [null],
      id_evento: [null],
    });
  }

  ngOnInit(): void {
    forkJoin({
      testimonios: this.testimonioService.getAll(),
      events: this.forumService.getEvents(),
    })
      .pipe(takeUntilDestroyed())
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
    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.topicForm.value;

    if (!formValue['id_testimonio'] && !formValue['id_evento']) {
      this.errorMessage = 'Debe vincular al menos un testimonio o un evento histórico';
      this.isSubmitting = false;
      return;
    }

    const topicData: { titulo: string; descripcion: string; id_evento?: number; id_testimonio?: number } = {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
    };

    if (formValue['id_testimonio']) topicData.id_testimonio = formValue['id_testimonio'];
    if (formValue['id_evento']) topicData.id_evento = formValue['id_evento'];

    this.forumService.createTopic(topicData)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.isSubmitting = false;
          this.notification.success('Tema creado exitosamente');
          this.router.navigate(['/forum']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = err.message || 'Error al crear el tema';
          this.notification.error(this.errorMessage);
        },
      });
  }
}
