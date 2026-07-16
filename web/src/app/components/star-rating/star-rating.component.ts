import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss',
})
export class StarRatingComponent {
  readonly rating = input<number>(0);

  protected readonly fullStars = computed(() => Array.from({ length: Math.floor(this.rating()) }));
  protected readonly hasHalfStar = computed(() => this.rating() % 1 !== 0);
}
