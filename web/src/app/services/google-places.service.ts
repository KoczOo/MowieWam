import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class GooglePlacesService {

    private apiKey = 'AIzaSyCbLtfz6to7qedTRmfP-_M7GAAeJoxliY8';
    private placesDetailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    private placeId = 'ChIJwcjs5xInGEcRzMrrS-3QuAA';

    constructor(private http: HttpClient) {
    }

    getPlaceDetails(): Observable<any> {
        const fields = 'name,rating,reviews';
        const url = `${this.placesDetailsUrl}?place_id=${this.placeId}&language=pl&fields=${fields}&key=${this.apiKey}`;
        return this.http.get(url);
    }
}
