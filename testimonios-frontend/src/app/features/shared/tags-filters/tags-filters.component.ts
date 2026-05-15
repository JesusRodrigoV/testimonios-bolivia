import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { ExploreFiltersStore } from '@app/features/testimony/stores/explore-filters.store';

@Component({
  selector: 'app-tags-filters',
  imports: [MatChipsModule],
  templateUrl: './tags-filters.component.html',
  styleUrl: './tags-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagsFiltersComponent implements OnInit {
  selectedTags = input<number[]>([]);
  selectedTagsChange = output<number[]>();

  private store = inject(ExploreFiltersStore);

  ngOnInit() {
    this.store.loadFilters();
  }

  get tags() {
    return this.store.tags();
  }

  toggleTag(id: number) {
    const current = this.selectedTags();
    const updated = current.includes(id)
      ? current.filter(t => t !== id)
      : [...current, id];
    this.selectedTagsChange.emit(updated);
  }

  onSelectionChange(event: MatChipListboxChange) {
  }
}
