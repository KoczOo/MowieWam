import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { GooglePlacesService } from './services/google-places.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly seo = inject(SeoService);
  private readonly places = inject(GooglePlacesService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.seo.initOrganizationGraph();

    this.places
      .getPlaceDetails()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        const rating = data?.result?.rating;
        const count = data?.result?.user_ratings_total;
        if (typeof rating === 'number' && typeof count === 'number') {
          this.seo.setAggregateRating(rating, count);
        }
      });
  }
}
