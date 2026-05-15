import { ChangeDetectionStrategy, Component, input, Input } from '@angular/core';
import { VgCoreModule, VgMediaDirective, VgMediaElement } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';

@Component({
  selector: 'app-video-player',
  imports: [
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,

  ],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoPlayerComponent {
  videoUrl = input.required<String>();
}
