import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { SpinnerComponent } from "@app/features/shared/ui/spinner";
import { MediaFormat } from "@app/features/testimony/models/media-format";
import { Testimony } from "@app/features/testimony/models/testimonio.model";
import { MatIconModule } from "@angular/material/icon";
import { VideoPlayerComponent } from "@app/features/shared/video-player";
import { Router } from "@angular/router";
import { DateUtilsService } from "@app/core/services";

@Component({
  selector: "app-testimony",
  imports: [
    DatePipe,
    SpinnerComponent,
    MatIconModule,
    VideoPlayerComponent,
  ],
  templateUrl: "./testimony.component.html",
  styleUrl: "./testimony.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonyComponent{
  readonly MediaFormat = MediaFormat;
  readonly testimony = input.required<Testimony>();


  private router = inject(Router);
  private dateUtil = inject(DateUtilsService);

  date = computed(() => this.dateUtil.getRelativeTime(this.testimony().createdAt));

  navigateToTestimony() {
    this.router.navigate(['/testimonies', this.testimony().id]);
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.navigateToTestimony();
    }
  }
}

