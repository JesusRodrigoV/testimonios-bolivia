import { Component, inject, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthStore } from "./auth.store";

@Component({
  selector: "app-root",
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  private authStore = inject(AuthStore);

  ngOnInit() {
    if (this.authStore.accessToken()) {
      this.authStore.loadUserProfile();
    }
  }
  title = "testimonios-frontend";
}
