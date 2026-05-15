import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Collection } from '../../models/collection.model';
import { Testimony } from '@app/features/testimony/models/testimonio.model';
import { CollectionService } from '../../services';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '@app/core/services/notification.service';
import { TestimonyComponent } from '@app/features/testimony/components/testimony';
import { SpinnerComponent } from '@app/features/shared/ui/spinner';
import { DatePipe } from '@angular/common';
import { combineLatest } from 'rxjs';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-collection-detail',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    TestimonyComponent,
    SpinnerComponent,
    DatePipe,
  ],
  templateUrl: './collection-detail.component.html',
  styleUrl: './collection-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CollectionDetailComponent implements OnInit {
  collection = signal<Collection | null>(null);
  testimonies = signal<Testimony[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  private collectionService = inject(CollectionService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  constructor() {}

  ngOnInit() {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    if (id) {
      this.loadData(id);
    } else {
      this.error.set('ID de colección no válido');
      this.notification.error('ID de colección no válido');
    }
  }

  private loadData(id: number) {
    this.loading.set(true);
    combineLatest([
      this.collectionService.getById(id),
      this.collectionService.getTestimonies(id),
    ]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ([collection, testimonies]) => {
        this.collection.set(collection);
        this.testimonies.set(testimonies);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la colección o los testimonios');
        this.notification.error('Error al cargar la colección o los testimonios');
        this.loading.set(false);
      },
    });
  }

  retry() {
    const id = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    if (id) {
      this.error.set(null);
      this.loadData(id);
    }
  }
}