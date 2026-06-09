import { NgOptimizedImage } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterLink } from "@angular/router";
import { AuthStore } from "@app/auth.store";

@Component({
  selector: "app-two-factor-setup",
  imports: [
    NgOptimizedImage,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: "./two-factor-setup.component.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TwoFactorSetupComponent {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  setupForm: FormGroup = this.fb.group({
    token: [
      "",
      [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
    ],
  });

  loading = this.authStore.loading;
  error = this.authStore.error;
  setupData = this.authStore.setupData;

  async onSubmit() {
    if (this.setupForm.valid && this.setupData()) {
      const { secret } = this.setupData()!;
      await this.authStore.setup2FA(secret, this.setupForm.value.token);
    }
  }
}
