import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-login-header',
  imports: [NgOptimizedImage],
  templateUrl: './login-header.component.html',
  styleUrl: '../../../../auth.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginHeaderComponent {
  title = input("Legado de Bolivia");
  subtitle = input("");
}
