import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-register-header',
  imports: [NgOptimizedImage],
  templateUrl: './register-header.component.html',
  styleUrl: '../../../../auth.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterHeaderComponent {
  title = input<string>('Legado de Bolivia');
  subtitle = input<string>('Crear Cuenta')
}
