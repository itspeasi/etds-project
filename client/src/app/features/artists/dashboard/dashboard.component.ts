import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AnalyticsService } from '../../analytics/analytics.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-artist-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class ArtistDashboardComponent implements OnInit {
  analyticsService = inject(AnalyticsService);
  authService = inject(AuthService);
  router = inject(Router);

  loading = true;
  
  // Data State
  rawComparisonData: any[] = [];
  rawVenueData: any[] = [];
  availableYears: number[] = [];
  selectedYear: number = new Date().getFullYear();

  // Comparison Chart
  public comparisonChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public comparisonChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'Sales Performance vs Top 5 Artists', color: '#f9fafb', font: { size: 16 } }
    },
    scales: {
      x: { ticks: { color: '#d1d5db' }, grid: { color: '#374151' } },
      y: { ticks: { color: '#d1d5db', callback: (val) => '$' + val }, grid: { color: '#374151' }, beginAtZero: true }
    }
  };

  // Venue Chart
  public venueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public venueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'My Sales by Venue', color: '#f9fafb', font: { size: 16 } }
    },
    scales: {
      x: { ticks: { color: '#d1d5db' }, grid: { color: '#374151' } },
      y: { ticks: { color: '#d1d5db', callback: (val) => '$' + val }, grid: { color: '#374151' }, beginAtZero: true }
    }
  };

  ngOnInit() {
    const user = this.authService.currentUser();
    if (!user || user.userType !== 'artist') {
      this.router.navigate(['/']);
      return;
    }

    this.analyticsService.getArtistDashboardData(user.id).subscribe({
      next: (data) => {
        this.rawComparisonData = data.comparisonData;
        this.rawVenueData = data.venueData;
        
        // Extract years from both datasets
        this.extractYears([...data.comparisonData, ...data.venueData]);
        
        if (!this.availableYears.includes(this.selectedYear) && this.availableYears.length > 0) {
          this.selectedYear = Math.max(...this.availableYears);
        }

        this.updateCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard data', err);
        this.loading = false;
      }
    });
  }

  extractYears(data: any[]) {
    data.forEach(d => {
      if (!this.availableYears.includes(d.year)) {
        this.availableYears.push(d.year);
      }
    });
    this.availableYears.sort((a, b) => b - a);
  }

  updateCharts() {
    this.processComparisonChart();
    this.processVenueChart();
  }

  getMonthLabels() {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  }

  processComparisonChart() {
    const yearData = this.rawComparisonData.filter(d => d.year === this.selectedYear);
    
    this.comparisonChartData.labels = this.getMonthLabels();

    const artistDataMap = new Map<string, { totals: number[], isMe: boolean }>();
    
    // Get unique artists in this year (or all known artists if you want lines to stay even if 0 sales)
    const uniqueArtists = [...new Set(this.rawComparisonData.map(d => d.artist))]; // Use ALL artists from raw data to keep consistency
    
    uniqueArtists.forEach(artist => {
      // Check if 'isMe' from the raw data. 
      // We find one entry for this artist to determine 'isMe'.
      const entry = this.rawComparisonData.find(d => d.artist === artist);
      artistDataMap.set(artist, { 
        totals: new Array(12).fill(0),
        isMe: entry ? entry.isMe : false 
      });
    });

    yearData.forEach(d => {
      const info = artistDataMap.get(d.artist);
      if (info) {
        info.totals[d.month - 1] = d.total;
      }
    });

    this.comparisonChartData.datasets = Array.from(artistDataMap.entries()).map(([artist, info], index) => {
      const color = info.isMe 
        ? '#3b82f6' 
        : this.getMutedColor(index); 

      return {
        data: info.totals,
        label: info.isMe ? `${artist} (You)` : artist,
        borderColor: color,
        backgroundColor: info.isMe ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        pointBackgroundColor: color,
        borderWidth: info.isMe ? 3 : 1.5,
        tension: 0.3,
        fill: info.isMe
      };
    });
  }

  processVenueChart() {
    const yearData = this.rawVenueData.filter(d => d.year === this.selectedYear);

    // Transform keys
    const transformed = yearData.map(d => ({
      ...d,
      venueKey: `${d.venueName} (${d.venueCity})`
    }));

    this.venueChartData.labels = this.getMonthLabels();

    const venueMap = new Map<string, number[]>();
    const uniqueVenues = [...new Set(transformed.map(d => d.venueKey))];

    uniqueVenues.forEach(v => venueMap.set(v, new Array(12).fill(0)));

    transformed.forEach(d => {
      const arr = venueMap.get(d.venueKey);
      if (arr) {
        arr[d.month - 1] = d.total;
      }
    });

    this.venueChartData.datasets = Array.from(venueMap.entries()).map(([venue, values], index) => ({
      data: values,
      label: venue,
      borderColor: this.getVibrantColor(index),
      pointBackgroundColor: this.getVibrantColor(index),
      tension: 0.3,
      fill: false
    }));
  }

  getMutedColor(index: number): string {
    const colors = ['#9ca3af', '#6b7280', '#d1d5db', '#4b5563', '#94a3b8'];
    return colors[index % colors.length];
  }

  getVibrantColor(index: number): string {
    const hues = [280, 15, 180, 45, 90, 320]; 
    return `hsla(${hues[index % hues.length]}, 70%, 60%, 1)`;
  }
}