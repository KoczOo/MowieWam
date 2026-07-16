import { HttpClient } from '@angular/common/http';
import { Injectable, inject, REQUEST } from '@angular/core';
import { Observable, catchError, of, shareReplay } from 'rxjs';
import { PlaceDetailsResponse } from '../dto/Reviews';


@Injectable({ providedIn: 'root' })
export class GooglePlacesService {
  private readonly http = inject(HttpClient);
  private readonly request = inject(REQUEST, { optional: true });

  private cachedDetails$?: Observable<PlaceDetailsResponse | null>;

  getPlaceDetails(): Observable<PlaceDetailsResponse | null> {
    if (!this.cachedDetails$) {
      this.cachedDetails$ = this.http
        .get<PlaceDetailsResponse>(this.buildUrl())
        .pipe(
          catchError(() => of(null)),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.cachedDetails$;
  }

  private buildUrl(): string {
    if (this.request) {
      const origin = new URL(this.request.url).origin;
      return `${origin}/api/reviews`;
    }
    return '/api/reviews';
  }
}
