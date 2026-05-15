import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Comment } from '@app/features/testimony/models/comment.model';
import { DatePipe, NgClass, NgOptimizedImage, TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-comment-item',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, DatePipe, NgClass, NgOptimizedImage, TitleCasePipe],
  templateUrl: './comment-item.component.html',
  styleUrl: './comment-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentItemComponent {
  comment = input.required<Comment>();
  isReply = input<boolean>(false);
  isLiked = input<boolean>(false);
  likeCount = input<number>(0);
  isAuthenticated = input<boolean>(false);
  isAuthor = input<boolean>(false);
  isAdmin = input<boolean>(false);
  expanded = input<boolean>(false);
  toggleLike = output<number>();
  startReply = output<number>();
  edit = output<Comment>();
  delete = output<number>();

  getRoleClass(role: string): string {
    const roleLower = role.toLowerCase();
    return ['administrador', 'curador', 'investigador'].includes(roleLower) ? roleLower : '';
  }

  formatLikeCount(count: number): string {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  }
}
