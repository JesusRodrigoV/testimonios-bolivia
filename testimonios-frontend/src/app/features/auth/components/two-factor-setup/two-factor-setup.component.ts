import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { AuthStore } from "@app/auth.store";

@Component({
  selector: "app-two-factor-setup",
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
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
