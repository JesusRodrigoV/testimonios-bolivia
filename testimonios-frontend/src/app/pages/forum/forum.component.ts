import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { ForumPostComponent } from '@app/features/forum/components/forum-post';
import { ForumService } from '@app/features/forum/services';
import { ForoTema } from '@app/features/forum/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-forum',
  imports: [ForumPostComponent, RouterLink, MatDividerModule, MatIconModule, MatButtonModule, MatTooltipModule, MatPaginatorModule],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ForumComponent {
  private forumService = inject(ForumService);

  topics: ForoTema[] = [];
  currentPage = 0;
  pageSize = 20;
  totalTopics = 0;
  isLoading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.loadTopics();
  }

  loadTopics(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.forumService.getAllTopics(this.currentPage + 1, this.pageSize)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (response) => {
          this.topics = response.data;
          this.totalTopics = response.meta.total;
          this.isLoading.set(false);
        },
        error: () => {
          this.error.set('Error al cargar los temas');
          this.isLoading.set(false);
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTopics();
  }
}
