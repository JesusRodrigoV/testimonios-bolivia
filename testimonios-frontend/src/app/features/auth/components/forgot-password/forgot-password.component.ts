import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { NotificationService } from '@app/core/services/notification.service';
import { Router } from "@angular/router";
import { AuthService } from "@app/features/auth/services/auth";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: "app-forgot-password",
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: "./forgot-password.component.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  protected loading = false;
  protected error: string | null = null;
  protected forgotPasswordForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.error = null;
      const email = this.forgotPasswordForm.get("email")?.value;

      this.authService.requestPasswordReset(email).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (response) => {
          this.notification.success(
            "Se han enviado las instrucciones a tu correo electrónico",
          );
          this.router.navigate(["/login"]);
          this.loading = false;
        },
        error: (err) => {
          const errorMessage =
            err.error?.message || "Ocurrió un error al procesar tu solicitud";
          this.error = errorMessage;
          this.notification.error(errorMessage);
          this.loading = false;
        },
      });
    }
  }
}