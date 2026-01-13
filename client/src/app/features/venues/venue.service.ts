import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Venue {
  _id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  capacity: number;
}


@Injectable({
  providedIn: 'root',
})

export class VenueService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/venues';

  getVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(this.apiUrl);
  }

  getVenue(id: string): Observable<Venue> {
    return this.http.get<Venue>(`${this.apiUrl}/${id}`);
  }

  createVenue(venue: Venue): Observable<Venue> {
    return this.http.post<Venue>(this.apiUrl, venue);
  }

  updateVenue(id: string, venue: Venue): Observable<Venue> {
    return this.http.put<Venue>(`${this.apiUrl}/${id}`, venue);
  }

  deleteVenue(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
