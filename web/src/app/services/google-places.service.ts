import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlaceDetailsResponse } from '../dto/Reviews';

@Injectable({ providedIn: 'root' })
export class GooglePlacesService {
  private readonly http = inject(HttpClient);

  private readonly apiKey = environment.googleApiKey;
  private readonly placesDetailsUrl = environment.placesDetailsUrl;
  private readonly placeId = environment.placeId;

  private cachedDetails$?: Observable<PlaceDetailsResponse | null>;

  getPlaceDetails(): Observable<PlaceDetailsResponse | null> {
    if (!this.cachedDetails$) {
      const fields = 'name,rating,reviews';
      const url =
        `${this.placesDetailsUrl}?place_id=${this.placeId}` +
        `&language=pl&fields=${fields}&key=${this.apiKey}`;

      this.cachedDetails$ = this.http.get<PlaceDetailsResponse>(url).pipe(
        catchError(() => of(null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.cachedDetails$;
  }
}
