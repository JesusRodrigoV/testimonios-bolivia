import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { Router } from "@angular/router";
import { NotificationService } from '@app/core/services/notification.service';
import { AuthService } from "@app/features/auth/services/auth";
import { firstValueFrom } from "rxjs";
import { RegisterFormComponent, RegisterHeaderComponent } from "./components";

@Component({
  selector: "app-register",
  imports: [
    MatCardModule,
    RegisterHeaderComponent,
    RegisterFormComponent
  ],
  templateUrl: "./register.component.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notification = inject(NotificationService);

  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit(formData: any) {
    if (formData) {
      this.loading.set(true);
      this.error.set(null);

      try {
        const { confirmPassword, ...registrationData } = formData;
        await firstValueFrom(this.authService.register(registrationData));

        this.notification.success(
          "Registro exitoso! Por favor inicia sesión",
        );

        await this.router.navigate(["/login"]);
      } catch (error: any) {
        this.error.set(
          error.error?.message || error.message || "Error al registrar usuario"
        );
      } finally {
        this.loading.set(false);
      }
    }
  }
}
