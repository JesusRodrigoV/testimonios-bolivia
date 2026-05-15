import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { ExploreFiltersStore } from '@app/features/testimony/stores/explore-filters.store';

@Component({
  selector: 'app-categories-filters',
  imports: [MatChipsModule],
  templateUrl: './categories-filters.component.html',
  styleUrl: './categories-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesFiltersComponent implements OnInit {
  selectedCategories = input<number[]>([]);
  selectedCategoriesChange = output<number[]>();

  private store = inject(ExploreFiltersStore);

  ngOnInit() {
    this.store.loadFilters();
  }

  get categorias() {
    return this.store.categories();
  }

  toggleCategory(id: number) {
    const updated = this.selectedCategories().includes(id)
      ? this.selectedCategories().filter(c => c !== id)
      : [...this.selectedCategories(), id];
    this.selectedCategoriesChange.emit(updated);
  }

  onSelectionChange(event: MatChipListboxChange) {
  }
}
