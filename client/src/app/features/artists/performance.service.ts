import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from '../events/event.service';

export interface Performance {
  _id?: string;
  artistProfile: any; // Can be string or populated object
  performanceName: string;
  startDate: string | Date;
  endDate: string | Date;
  isActive: boolean;
  events?: Event[];
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/performances';

  getPerformances(artistProfileId: string): Observable<Performance[]> {
    return this.http.get<Performance[]>(`${this.apiUrl}/by-artist/${artistProfileId}`);
  }

  getAllPerformances(): Observable<Performance[]> {
    return this.http.get<Performance[]>(this.apiUrl);
  }

  createPerformance(performance: Partial<Performance>): Observable<Performance> {
    return this.http.post<Performance>(this.apiUrl, performance);
  }

  updatePerformance(id: string, performance: Partial<Performance>): Observable<Performance> {
    return this.http.put<Performance>(`${this.apiUrl}/${id}`, performance);
  }

  deletePerformance(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}