import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NotificationService } from '@app/core/services/notification.service';
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@app/features/auth/services/auth";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: "app-reset-password",
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./reset-password.component.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  protected loading = false;
  protected hidePassword = true;
  private token: string | null = null;

  protected resetPasswordForm: FormGroup = this.fb.group(
    {
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", [Validators.required]],
    },
    { validator: this.passwordMatchValidator },
  );

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get("token");
    if (!this.token) {
      this.notification.error("Token inválido o expirado");
      this.router.navigate(["/forgot-password"]);
    }
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get("password")?.value === g.get("confirmPassword")?.value
      ? null
      : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.resetPasswordForm.valid && this.token) {
      this.loading = true;
      const newPassword = this.resetPasswordForm.get("password")?.value;

      this.authService
        .resetPassword(this.token, newPassword)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            this.notification.success(
              "Tu contraseña ha sido actualizada exitosamente",
            );
            this.router.navigate(["/login"]);
          },
          error: (error) => {
            this.notification.error(
              error.message || "Error al restablecer la contraseña",
            );
            this.loading = false;
          },
        });
    }
  }
}
