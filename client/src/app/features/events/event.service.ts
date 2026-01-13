import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Performance } from '../artists/performance.service';
import { Venue } from '../venues/venue.service';

export interface Event {
  _id?: string;
  performance: Performance | any;
  venue: Venue | any;
  distributor: string | any;
  startDateTime: string | Date;
  endDateTime: string | Date;
  status: 'pending' | 'approved' | 'rejected' | 'canceled';
  ticketPrice: number;
  ticketsSold: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/events';

  getEvents(distributorId?: string): Observable<Event[]> {
    let params = new HttpParams();
    if (distributorId) {
      params = params.append('distributorId', distributorId);
    }
    return this.http.get<Event[]>(this.apiUrl, { params });
  }

  getUpcomingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/upcoming`);
  }

  createEvent(event: Partial<Event>): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event);
  }

  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, event);
  }

  getEventsForArtist(artistProfileId: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/for-artist/${artistProfileId}`);
  }

  getEventsByVenue(venueId: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/by-venue/${venueId}`);
  }

  updateEventStatus(eventId: string, status: 'approved' | 'rejected'): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${eventId}/status`, { status });
  }

  cancelEvent(eventId: string): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${eventId}/cancel`, {});
  }

  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}