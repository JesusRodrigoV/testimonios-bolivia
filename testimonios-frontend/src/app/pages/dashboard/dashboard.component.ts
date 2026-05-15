import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from "@angular/core";
import { MatTabsModule } from "@angular/material/tabs";
import { ActivatedRoute } from "@angular/router";
import { UserManagementComponent } from "./user-management";
import { TestimonyManagementComponent } from "./testimony-management";
import { CommentManagementComponent } from "./comment-management";
import { EventManagementComponent } from "./event-management";

@Component({
  selector: "app-dashboard",
  imports: [
    MatTabsModule,
    UserManagementComponent,
    TestimonyManagementComponent,
    CommentManagementComponent,
    EventManagementComponent,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  selectedTab = signal(0);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const tab = parseInt(params["tab"], 10);
      if (!isNaN(tab) && tab >= 0 && tab <= 3) {
        this.selectedTab.set(tab);
      }
    });
  }
}
