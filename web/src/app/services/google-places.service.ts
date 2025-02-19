import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class GooglePlacesService {

    private apiKey = environment.googleApiKey;
    private placesDetailsUrl = environment.placesDetailsUrl
    private placeId = environment.placeId;

    constructor(private http: HttpClient) {
    }

    getPlaceDetails(): Observable<any> {
        const fields = 'name,rating,reviews';
        const url = `${this.placesDetailsUrl}?place_id=${this.placeId}&language=pl&fields=${fields}&key=${this.apiKey}`;
        return this.http.get(url);
    }
}
