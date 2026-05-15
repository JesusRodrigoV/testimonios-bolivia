import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register-form',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule
  ],
  templateUrl: './register-form.component.html',
  styleUrl: '../../../../auth.styles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterFormComponent {
  buttonText = input<string>('Crear cuenta');
  loading = input<boolean>(false);
  error = input<string | null>(null);
  onSubmit = output<any>();

  hidePassword = true;
  hideConfirmPassword = true;

  private fb = inject(FormBuilder);

  personalInfo = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    biografia: [''],
  });

  accountDetails = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator,
    }
  );

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  submit() {
    if (this.personalInfo.valid && this.accountDetails.valid) {
      const formData = {
        ...this.personalInfo.value,
        ...this.accountDetails.value,
      };
      this.onSubmit.emit(formData);
    }
  }
}
