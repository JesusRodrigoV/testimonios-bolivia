import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ForoTema } from '../../models';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forum-post',
  imports: [NgOptimizedImage, MatCardModule, MatIconModule, DatePipe],
  templateUrl: './forum-post.component.html',
  styleUrl: './forum-post.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForumPostComponent {
  private router = inject(Router);

  topicInfo = input.required<ForoTema>();

  goToPost(id: number) {
    this.router.navigate([`forum/post/${id}`]);
  }
}
