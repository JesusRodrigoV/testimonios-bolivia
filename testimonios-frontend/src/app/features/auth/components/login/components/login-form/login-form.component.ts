import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-form',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: '../../../../auth.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);

  buttonText = input("Iniciar sesión");
  loading = input(false);
  error = input<string | null>(null);
  showRegisterLink = input(true);
  onSubmit = output<{ email: string; password: string }>();

  hidePassword = true;

  form: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required],
  });

  submit() {
    if (this.form.valid) {
      this.onSubmit.emit(this.form.value);
    }
  }
}
