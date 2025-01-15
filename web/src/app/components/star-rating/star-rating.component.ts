import {Component, Input} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-star-rating',
  imports: [
    NgIf,
    NgForOf
  ],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss'
})
export class StarRatingComponent {
  @Input() rating: number = 0;

  get stars() {
    return Array(Math.floor(this.rating)).fill(0);
  }
}
