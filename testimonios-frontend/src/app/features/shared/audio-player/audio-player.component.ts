import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgxAudioPlayerModule } from 'ngx-audio-player';
import type { Track } from 'ngx-audio-player';

interface AudioTestimony {
  title: string;
  url: string;
  author: string;
  duration: number;
}

@Component({
  selector: 'app-audio-player',
  imports: [NgxAudioPlayerModule],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AudioPlayerComponent {
  readonly testimonyData = input.required<AudioTestimony>();

  mssapDisplayTitle = false;
  mssapDisablePositionSlider = false;
  mssapDisplayRepeatControls = false;
  mssapDisplayVolumeControls = false;
  mssapDisplayVolumeSlider = false;

  onTrackEnded(_event: any) {
    // track ended handler
  }

  get playlist(): Track[] {
    const data = this.testimonyData();
    return [
      {
        title: data.title,
        link: data.url,
        artist: data.author,
        duration: data.duration,
        mediaType: 'stream'
      },
    ];
  }
}
