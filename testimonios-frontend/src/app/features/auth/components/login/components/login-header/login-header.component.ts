import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-header',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './login-header.component.html',
  styleUrl: '../../../../auth.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginHeaderComponent {
  title = input("Legado de Bolivia");
  subtitle = input("");
}
