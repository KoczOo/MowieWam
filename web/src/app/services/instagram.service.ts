import { HttpClient } from '@angular/common/http';
import { Injectable, REQUEST, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { InstagramPost, InstagramPostsResponse } from '../dto/InstagramPost';

/**
 * Posts are fetched from the local SSR-backed endpoint (`/api/instagram-posts`),
 * which proxies Instagram Graph API. The access token stays server-side.
 * Response is cached by `withHttpTransferCache`, so hydration reuses SSR data.
 */
@Injectable({ providedIn: 'root' })
export class InstagramService {
  private readonly http = inject(HttpClient);
  private readonly request = inject(REQUEST, { optional: true });

  private cached$?: Observable<ReadonlyArray<InstagramPost>>;

  getPosts(limit = 8): Observable<ReadonlyArray<InstagramPost>> {
    if (!this.cached$) {
      this.cached$ = this.http
        .get<InstagramPostsResponse>(this.buildUrl())
        .pipe(
          map((res) => res.posts ?? []),
          catchError(() => of<ReadonlyArray<InstagramPost>>([])),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.cached$.pipe(map((posts) => posts.slice(0, limit)));
  }

  private buildUrl(): string {
    if (this.request) {
      const origin = new URL(this.request.url).origin;
      return `${origin}/api/instagram-posts`;
    }
    return '/api/instagram-posts';
  }
}
