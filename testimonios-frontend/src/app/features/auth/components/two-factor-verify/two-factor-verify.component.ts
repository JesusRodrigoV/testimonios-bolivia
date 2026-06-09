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
  selector: "app-two-factor-verify",
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: "./two-factor-verify.component.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TwoFactorVerifyComponent {
  private readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  twoFactorForm: FormGroup = this.fb.group({
    token: [
      "",
      [
        Validators.required,
        Validators.pattern("^[0-9]*$"),
        Validators.minLength(6),
        Validators.maxLength(6),
      ],
    ],
  });

  loading = this.authStore.loading;
  error = this.authStore.error;

  async onSubmit() {
    if (this.twoFactorForm.valid) {
      const token = this.twoFactorForm.value.token;
      await this.authStore.verify2FA(token);
    }
  }
}
