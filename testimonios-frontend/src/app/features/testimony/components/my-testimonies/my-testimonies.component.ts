import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { Testimony } from "../../models/testimonio.model";
import { TestimonioService } from "../../services";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TestimonyCardComponent } from "./components/testimony-card";
import { NotificationService } from '@app/core/services/notification.service';
import { Router } from "@angular/router";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: "app-my-testimonies",
  imports: [RouterLink, MatButtonModule, MatIconModule, TestimonyCardComponent],
  templateUrl: "./my-testimonies.component.html",
  styleUrl: "./my-testimonies.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MyTestimoniesComponent {
  protected testimonies = signal<Testimony[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  private testimonyService = inject(TestimonioService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.loadTestimonies();
  }

  loadTestimonies(): void {
    this.loading.set(true);
    this.error.set(null);
    this.testimonyService.getMyTestimonies().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (testimonies) => {
        this.testimonies.set(testimonies);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set("Error al cargar testimonios");
        this.notification.error("Error al cargar testimonios");
      },
    });
  }

  editTestimony(testimony: Testimony): void {
    this.router.navigate(["/testimonies", testimony.id, "edit"]);
  }

  deleteTestimony(testimony: Testimony): void {
    this.notification.info(
      "La eliminación está en desarrollo. Por ahora, no es posible eliminar testimonios.",
      "Cerrar",
      { duration: 5000 }
    );
  }
}
