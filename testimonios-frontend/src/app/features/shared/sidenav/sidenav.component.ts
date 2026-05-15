import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AuthStore } from "@app/auth.store";
import { SidenavItem } from "./models/sidenav-button.model";
import { SidenavButtonComponent } from "./sidenav-button/sidenav-button.component";

export const Rol = {
  ADMIN: 1,
  CURATOR: 2,
  RESEARCHER: 3,
  VISITOR: 4,
} as const;

@Component({
  selector: "app-sidenav",
  imports: [
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,
    SidenavButtonComponent,
  ],
  templateUrl: "./sidenav.component.html",
  styleUrl: "./sidenav.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavComponent {
  private authStore = inject(AuthStore);
  toggleSidenav = output<void>();
  isExpanded = signal(true);

  private allItems: SidenavItem[] = [
    {
      routerLink: "/home",
      icon: "home",
      text: "Inicio",
      exact: true,
      tooltip: "Ir a Inicio",
    },
    {
      routerLink: "/explore",
      icon: "explore",
      text: "Explorar",
      tooltip: "Explorar testimonios",
    },
    {
      routerLink: "/collections",
      icon: "collections_bookmark",
      text: "Mis colecciones",
      tooltip: "Ver mis colecciones",
      requiredAuth: true,
      dividerBefore: true,
    },
    {
      routerLink: "/maps",
      icon: "map",
      text: "Mapas",
      tooltip: "Ver ubicacion de cada testimonio",
    },
    {
      routerLink: "/forum",
      icon: "forum",
      text: "Foro",
      tooltip: "Ir al foro de discusion",
    },
  ];

  filteredItems = computed(() => {
    const isAuth = this.authStore.isAuthenticated();
    const userRole = this.authStore.userRole();
    return this.allItems.filter((item) => {
      if (item.requiredAuth && !isAuth) return false;
      if (item.requiredRole && userRole) {
        if (!item.requiredRole.includes(userRole)) return false;
      }
      return true;
    });
  });

  toggle() {
    this.isExpanded.update((v) => !v);
    this.toggleSidenav.emit();
  }
}
