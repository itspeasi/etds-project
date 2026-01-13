import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnalyticsService, TopArtist } from '../analytics.service';

@Component({
  selector: 'app-top-artists',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './top-artists.component.html',
  styleUrl: './top-artists.component.scss'
})
export class TopArtistsComponent implements OnInit {
  analyticsService = inject(AnalyticsService);
  topArtists: TopArtist[] = [];
  loading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData(forceRefresh: boolean = false) {
    this.loading = true;
    this.analyticsService.getTopArtists(forceRefresh).subscribe({
      next: (data) => {
        this.topArtists = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load top artists', err);
        this.loading = false;
      }
    });
  }

  refreshData() {
    this.loadData(true);
  }
}