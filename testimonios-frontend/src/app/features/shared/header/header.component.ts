import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  output,
  signal,
  DestroyRef,
} from "@angular/core";
import { DatePipe, NgOptimizedImage } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDividerModule } from "@angular/material/divider";
import { MatBadgeModule } from "@angular/material/badge";
import { AuthStore } from "@app/auth.store";
import { FavoritesStore } from "@app/stores/favorites.store";
import { Router, RouterLink } from "@angular/router";
import { GoldenDirective } from "@app/core/directives/golden.directive";
import { ThemeService } from "@app/core/services";
import { Notificacion } from "@app/features/notification/model/notification.model";
import { NotificationService as ApiNotificationService, NotificationSseService } from "@app/features/notification/services";
import { SpinnerComponent } from "../ui/spinner";
import { SearchBarComponent } from "../search/components/search-bar";
import { NotificationService } from '@app/core/services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export const Rol = {
  ADMIN: 1,
  CURATOR: 2,
  RESEARCHER: 3,
  VISITOR: 4,
} as const;

@Component({
  selector: "app-header",
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    RouterLink,
    GoldenDirective,
    NgOptimizedImage,
    SpinnerComponent,
    DatePipe,
    SearchBarComponent,
  ],
  templateUrl: "./header.component.html",
  styleUrl: "./header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(document:keydown.escape)": "onEscapePress()",
  },
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileSearchActive = signal<boolean>(false);
  notifications = signal<Notificacion[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  protected readonly authStore = inject(AuthStore);
  private readonly favoritesStore = inject(FavoritesStore);
  private readonly router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private themeService = inject(ThemeService);
  private readonly notificationService = inject(ApiNotificationService);
  private readonly notificationSseService = inject(NotificationSseService);
  private readonly notification = inject(NotificationService);
  private previousToken = '';

  toggleSidebar = output<void>();

  private readonly accessTokenEffect = effect(() => {
    const token = this.authStore.accessToken();
    if (token && token !== this.previousToken) {
      this.previousToken = token;
      this.loadNotifications();
      this.connectSse(token);
    } else if (!token) {
      this.previousToken = '';
      this.notifications.set([]);
      this.notificationSseService.disconnect();
    }
  });

  unreadList = computed(() =>
    this.notifications().filter((n) => !n.leido)
  );

  unreadNotifications = computed(() => this.unreadList().length);

  isAdmin = computed(() => this.authStore.user()?.role === Rol.ADMIN);

  ngOnInit() {
    this.authStore.loadUserProfile();
  }

  ngOnDestroy() {
    document.body.style.overflow = "";
    this.notificationSseService.disconnect();
  }

  private connectSse(token: string): void {
    this.notificationSseService.disconnect();
    this.notificationSseService.connect(token);

    this.notificationSseService.newNotification$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((notification) => {
        this.notifications.update((current) => {
          if (current.some((n) => n.id_notificacion === notification.id_notificacion)) {
            return current;
          }
          return [notification, ...current];
        });

        this.notification.info(
          notification.mensaje.substring(0, 60),
          'Ver',
          { duration: 4000 }
        );
      });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onToggleMobileSearch(isActive: boolean) {
    this.isMobileSearchActive.set(isActive);
    document.body.style.overflow = isActive ? "hidden" : "";
  }

  onEscapePress() {
    if (this.isMobileSearchActive()) {
      this.onToggleMobileSearch(false);
    }
  }

  async onLogout() {
    this.notificationSseService.disconnect();
    this.favoritesStore.reset();
    await this.authStore.logout();
    await this.router.navigate(["/login"]);
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  loadNotifications() {
    if (!this.authStore.isAuthenticated()) {
      this.notifications.set([]);
      this.isLoading.set(false);
      this.error.set(null);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.notificationService.getUnread().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (notifications) => {
        this.notifications.set(notifications);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set("No se pudieron cargar las notificaciones");
        this.isLoading.set(false);
      },
    });
  }

  markAllAsRead() {
    this.notificationService.marcarTodasComoLeidas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notifications.update((notifs) =>
          notifs.map((n) => ({ ...n, leido: true }))
        );
      },
      error: () => {},
    });
  }

  onNotificationClick(notif: Notificacion) {
    if (!notif.leido) {
      this.notificationService.marcarComoLeido(notif.id_notificacion).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (updatedNotification) => {
          if (updatedNotification) {
            this.notifications.update((notifs) =>
              notifs.map((n) =>
                n.id_notificacion === notif.id_notificacion ? { ...n, leido: true } : n
              )
            );
          }
          this.navigateToNotif(notif);
        },
        error: () => {},
      });
    } else {
      this.navigateToNotif(notif);
    }
  }

  onNotificationKeydown(event: KeyboardEvent, notif: Notificacion) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onNotificationClick(notif);
    }
  }

  private navigateToNotif(notif: Notificacion) {
    if (this.isAdmin() && notif.estado?.nombre === 'pendiente') {
      this.router.navigate(['/dashboard'], { queryParams: { tab: 1, status: 'pendiente' } });
      return;
    }
    if (notif.id_testimonio) {
      this.router.navigate(['/testimonies', notif.id_testimonio]);
    } else if (notif.id_forotema) {
      this.router.navigate(["/forum", notif.id_forotema]);
    }
  }
}
