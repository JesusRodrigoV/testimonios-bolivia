import { ChangeDetectionStrategy, Component, inject, input, OnInit, output } from '@angular/core';
import { MatChipListboxChange, MatChipsModule } from '@angular/material/chips';
import { ExploreFiltersStore } from '@app/features/testimony/stores/explore-filters.store';

@Component({
  selector: 'app-events-filters',
  imports: [MatChipsModule],
  templateUrl: './events-filters.component.html',
  styleUrl: './events-filters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsFiltersComponent implements OnInit {
  selectedEvents = input<number[]>([]);
  selectedEventsChange = output<number[]>();

  private store = inject(ExploreFiltersStore);

  ngOnInit() {
    this.store.loadFilters();
  }

  get events() {
    return this.store.events();
  }

  toggleEvent(id: number) {
    const updated = this.selectedEvents().includes(id) ? [] : [id];
    this.selectedEventsChange.emit(updated);
  }

  onSelectionChange(event: MatChipListboxChange) {
  }
}
