import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GoldenDirective } from '@app/core/directives/golden.directive';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search-bar',
  imports: [FormsModule, GoldenDirective, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBarComponent {
  isMobile = input<boolean>(false);
  isActive = input<boolean>(false);
  toggleMobile = output<boolean>();

  searchQuery = '';

  searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  private querySubject = new Subject<string>();
  private searchService = inject(SearchService);

  constructor() {
    this.querySubject.pipe(debounceTime(300), takeUntilDestroyed()).subscribe((query) => {
      this.searchService.setSearchQuery(query);
    });
  }

  onQueryChange(): void {
    this.querySubject.next(this.searchQuery);
  }

  onSearch(): void {
    this.searchService.setSearchQuery(this.searchQuery.trim());
    if (this.isMobile() && this.isActive()) {
      this.toggleMobileSearch();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchService.clearSearchQuery();
    this.searchInput().nativeElement.focus();
  }

  toggleMobileSearch(): void {
    this.toggleMobile.emit(!this.isActive());
    if (!this.isActive() && this.searchInput()) {
      setTimeout(() => this.searchInput().nativeElement.focus(), 300);
    }
  }
}