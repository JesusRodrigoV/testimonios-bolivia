import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from '@app/features/shared/footer';
import { HeaderComponent } from '@app/features/shared/header';
import { SidenavComponent } from '@app/features/shared/sidenav';
import { SearchDialogComponent } from '@app/features/shared/search/components/search-dialog';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, MatIconModule, SidenavComponent, FooterComponent, HeaderComponent, SearchDialogComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LayoutComponent {
}