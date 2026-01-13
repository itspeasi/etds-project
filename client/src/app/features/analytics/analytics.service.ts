import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TopArtist {
  _id: string;
  artistName: string;
  imageUrl: string;
  grossSales: number;
  favoriteVenue: {
    name: string;
    city: string;
    state: string;
  };
}

export interface DistributorSalesData {
  month: number;
  year: number;
  artist: string;
  total: number;
}

export interface DistributorVenueSalesData {
  month: number;
  year: number;
  venueName: string;
  venueCity: string;
  venueState: string;
  total: number;
}

export interface ArtistDashboardData {
  comparisonData: {
    month: number;
    year: number;
    artist: string;
    artistId: string;
    total: number;
    isMe: boolean;
  }[];
  venueData: {
    month: number;
    year: number;
    venueName: string;
    venueCity: string;
    total: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/analytics';

  getTopArtists(forceRefresh: boolean = false): Observable<TopArtist[]> {
    let params = new HttpParams();
    if (forceRefresh) {
      params = params.set('refresh', 'true');
    }
    return this.http.get<TopArtist[]>(`${this.apiUrl}/top-artists`, { params });
  }

  getDistributorSales(distributorId: string): Observable<DistributorSalesData[]> {
    return this.http.get<DistributorSalesData[]>(`${this.apiUrl}/distributor/${distributorId}/sales`);
  }

  getDistributorSalesByVenue(distributorId: string): Observable<DistributorVenueSalesData[]> {
    return this.http.get<DistributorVenueSalesData[]>(`${this.apiUrl}/distributor/${distributorId}/sales-by-venue`);
  }

  getArtistDashboardData(userId: string): Observable<ArtistDashboardData> {
    return this.http.get<ArtistDashboardData>(`${this.apiUrl}/artist/${userId}/sales-comparison`);
  }
}