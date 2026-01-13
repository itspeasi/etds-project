import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ticket {
  _id: string;
  event: any;
  user: any;
  transaction: string;
  price: number;
  status: string;
  purchaseDate: Date | string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/tickets';

  purchaseTickets(purchaseData: { eventId: string, quantity: number, userId: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/purchase`, purchaseData);
  }

  getMyTickets(userId: string, page: number = 1, limit: number = 20): Observable<Ticket[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<Ticket[]>(`${this.apiUrl}/my-tickets/${userId}`, { params });
  }

  getAllTickets(page: number = 1, limit: number = 50): Observable<Ticket[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<Ticket[]>(`${this.apiUrl}/all`, { params });
  }

  updateTicket(id: string, data: Partial<Ticket>): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, data);
  }
}