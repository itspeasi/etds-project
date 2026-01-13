import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/admin';

  getCollectionNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/collections`);
  }

  getCollectionData(collectionName: string, page: number = 1, limit: number = 50): Observable<{ data: any[], total: number, page: number, totalPages: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<{ data: any[], total: number, page: number, totalPages: number }>(`${this.apiUrl}/collections/${collectionName}`, { params });
  }

  deleteCollection(collectionName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/collections/${collectionName}`);
  }

  exportAllCollections(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-all`, { responseType: 'blob' });
  }

  // Database Management
  resetDatabase(): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-db`, {});
  }

  clearDatabase(): Observable<any> {
    return this.http.post(`${this.apiUrl}/clear-db`, {});
  }
}