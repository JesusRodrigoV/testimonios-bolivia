import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { SidenavItem } from "../models/sidenav-button.model";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

@Component({
  selector: "app-sidenav-button",
  imports: [
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: "./sidenav-button.component.html",
  styleUrl: "./sidenav-button.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavButtonComponent {
  item = input.required<SidenavItem>();
  isExpanded = input(true);
}
