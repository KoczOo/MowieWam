import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { GooglePlacesService } from './google-places.service';

describe('GooglePlacesService', () => {
  let service: GooglePlacesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GooglePlacesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('calls the local /api/reviews proxy', () => {
    service.getPlaceDetails().subscribe();
    const req = http.expectOne('/api/reviews');
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'OK', result: { name: 'Test', rating: 5, reviews: [] } });
  });
});
