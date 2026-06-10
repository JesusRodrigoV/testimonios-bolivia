import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FooterComponent } from '@app/features/shared/footer';
import { HeaderComponent } from '@app/features/shared/header';
import { SidenavComponent } from '@app/features/shared/sidenav';
import { SearchDialogComponent } from '@app/features/shared/search/components/search-dialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, MatIconModule, MatProgressBarModule, SidenavComponent, FooterComponent, HeaderComponent, SearchDialogComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  navigating = signal(false);
  private navigationTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navigationTimeout = setTimeout(() => this.navigating.set(true), 300);
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        if (this.navigationTimeout) clearTimeout(this.navigationTimeout);
        this.navigating.set(false);
      }
    });
  }
}