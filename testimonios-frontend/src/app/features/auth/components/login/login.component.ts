import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { AuthStore } from "@app/auth.store";
import { MatCardModule } from "@angular/material/card";
import { LoginFormComponent, LoginHeaderComponent } from "./components";

@Component({
  selector: "app-login",
  imports: [
    LoginHeaderComponent,
    LoginFormComponent,
    MatCardModule,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  private readonly authStore = inject(AuthStore);

  loading = this.authStore.loading;
  error = this.authStore.error;

  async onSubmit(credentials: { email: string; password: string }) {
    await this.authStore.login(credentials);
  }
}
