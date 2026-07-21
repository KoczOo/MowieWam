import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, REQUEST } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

export interface ContactRequest {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly subject: string;
  readonly message: string;
  readonly consent: boolean;
  readonly website: string;
}

export type ContactSendResult = 'ok' | 'rate_limited' | 'invalid' | 'unavailable' | 'error';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);
  private readonly request = inject(REQUEST, { optional: true });

  send(payload: ContactRequest): Observable<ContactSendResult> {
    return this.http.post(this.buildUrl(), payload, { observe: 'response' }).pipe(
      map(() => 'ok' as const),
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 429) return of('rate_limited' as const);
          if (err.status === 400) return of('invalid' as const);
          if (err.status === 503) return of('unavailable' as const);
        }
        return of('error' as const);
      }),
    );
  }

  private buildUrl(): string {
    if (this.request) {
      const origin = new URL(this.request.url).origin;
      return `${origin}/api/contact`;
    }
    return '/api/contact';
  }
}
