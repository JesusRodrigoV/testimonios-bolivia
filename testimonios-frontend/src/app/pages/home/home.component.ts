import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from "@angular/core";
import { HeroSectionComponent } from "./components/hero-section";
import { Testimony } from "@app/features/testimony/models/testimonio.model";
import { TestimonyComponent } from "@app/features/testimony/components/testimony";
import { SpinnerComponent } from "@app/features/shared/ui/spinner";
import { CalificationService } from "@app/features/testimony/services";
import { CacheService, NotificationService } from "@app/core/services";
import { Subscription } from "rxjs";
import { register } from 'swiper/element';

register();

@Component({
  selector: "app-home",
  imports: [
    TestimonyComponent,
    HeroSectionComponent,
    SpinnerComponent,
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class HomeComponent implements OnInit, OnDestroy {
  highlightedTestimonies = signal<Testimony[]>([]);
  loading = signal<boolean>(false);

  private subscriptions = new Subscription();
  private calificationService = inject(CalificationService);
  private cacheService = inject(CacheService);
  private notification = inject(NotificationService);

  ngOnInit() {
    this.loadHighlightedTestimonies();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadHighlightedTestimonies() {
    const cached = this.cacheService.getHighlightedTestimonies();
    if (cached) {
      this.highlightedTestimonies.set(cached);
      return;
    }
    this.loading.set(true);
    const sub = this.calificationService.getTopRatedTestimonies(5).subscribe({
      next: (testimonies) => {
        this.highlightedTestimonies.set([...testimonies]);
        this.cacheService.setHighlightedTestimonies(testimonies);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error("Error al cargar testimonios destacados");
        this.loading.set(false);
      },
    });

    this.subscriptions.add(sub);
  }
}
