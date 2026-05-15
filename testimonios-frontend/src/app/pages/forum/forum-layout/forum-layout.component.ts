import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@app/features/shared/header';
import { SidenavComponent } from '@app/features/shared/sidenav';

@Component({
  selector: 'app-forum-layout',
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, MatIconModule, SidenavComponent, HeaderComponent],
  templateUrl: './forum-layout.component.html',
  styleUrl: './forum-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class ForumLayoutComponent {

}
