import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Performance } from './performance.service';

export interface ArtistProfile {
  _id?: string;
  user: string;
  artistName: string;
  bio: string;
  imageUrl: string;
}

export interface ArtistProfileWithPerformances {
  profile: ArtistProfile;
  performances: Performance[];
}

@Injectable({
  providedIn: 'root'
})
export class ArtistProfileService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3001/api/artist-profiles';

  getArtistProfiles(): Observable<ArtistProfile[]> {
    return this.http.get<ArtistProfile[]>(this.apiUrl);
  }

  getArtistProfile(userId: string): Observable<ArtistProfile | null> {
    return this.http.get<ArtistProfile | null>(`${this.apiUrl}/by-user/${userId}`);
  }

  getArtistProfileWithPerformances(id: string): Observable<ArtistProfileWithPerformances> {
    return this.http.get<ArtistProfileWithPerformances>(`${this.apiUrl}/${id}`);
  }

  saveArtistProfile(profile: Partial<ArtistProfile>): Observable<ArtistProfile> {
    return this.http.post<ArtistProfile>(this.apiUrl, profile);
  }
}