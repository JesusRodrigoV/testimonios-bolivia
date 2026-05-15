import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTabsModule } from "@angular/material/tabs";
import { ThemeService } from "@app/core/services";

@Component({
  selector: "app-settings",
  imports: [
    MatCardModule,
    MatSlideToggleModule,
    MatTabsModule,
  ],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SettingsComponent {
  private themeService = inject(ThemeService);

  get darkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  onThemeChange(isDark: boolean): void {
    this.themeService.setTheme(isDark ? "dark" : "light");
  }
}
