import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AnalyticsService } from '../../analytics/analytics.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-distributor-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DistributorDashboardComponent implements OnInit {
  analyticsService = inject(AnalyticsService);
  authService = inject(AuthService);
  router = inject(Router);

  loading = true;
  
  // Data State
  rawSalesData: any[] = [];
  rawVenueData: any[] = [];
  availableYears: number[] = [];
  selectedYear: number = new Date().getFullYear();

  // Artist Chart Config
  public artistChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public artistChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'Monthly Gross Sales by Artist', color: '#f9fafb', font: { size: 16 } }
    },
    scales: {
      x: { ticks: { color: '#d1d5db' }, grid: { color: '#374151' } },
      y: { ticks: { color: '#d1d5db', callback: (val) => '$' + val }, grid: { color: '#374151' }, beginAtZero: true }
    }
  };

  // Venue Chart Config
  public venueChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };

  public venueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'Monthly Gross Sales by Venue', color: '#f9fafb', font: { size: 16 } }
    },
    scales: {
      x: { ticks: { color: '#d1d5db' }, grid: { color: '#374151' } },
      y: { ticks: { color: '#d1d5db', callback: (val) => '$' + val }, grid: { color: '#374151' }, beginAtZero: true }
    }
  };

  ngOnInit() {
    const user = this.authService.currentUser();
    if (!user || user.userType !== 'distributor') {
      this.router.navigate(['/']);
      return;
    }

    // Fetch Artist Data
    this.analyticsService.getDistributorSales(user.id).subscribe({
      next: (data) => {
        this.rawSalesData = data;
        this.extractYears(data);
        this.checkLoading();
      },
      error: (err) => {
        console.error(err);
        this.checkLoading();
      }
    });

    // Fetch Venue Data
    this.analyticsService.getDistributorSalesByVenue(user.id).subscribe({
      next: (data) => {
        this.rawVenueData = data;
        this.extractYears(data); // Check venue data for years too
        this.checkLoading();
      },
      error: (err) => {
        console.error(err);
        this.checkLoading();
      }
    });
  }

  loadingCount = 0;
  checkLoading() {
    this.loadingCount++;
    if (this.loadingCount >= 2) {
      // Set default year to current year, or the latest available if current has no data
      if (!this.availableYears.includes(this.selectedYear) && this.availableYears.length > 0) {
        this.selectedYear = Math.max(...this.availableYears);
      }
      this.updateCharts();
      this.loading = false;
    }
  }

  extractYears(data: any[]) {
    data.forEach(d => {
      if (!this.availableYears.includes(d.year)) {
        this.availableYears.push(d.year);
      }
    });
    this.availableYears.sort((a, b) => b - a); // Descending
  }

  updateCharts() {
    this.processArtistChartData();
    this.processVenueChartData();
  }

  // Generic labels for full year
  getMonthLabels() {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  }

  processArtistChartData() {
    // Filter by selected year
    const yearData = this.rawSalesData.filter(d => d.year === this.selectedYear);

    this.artistChartData.labels = this.getMonthLabels();

    // Group by Artist
    const artistDataMap = new Map<string, number[]>();
    const uniqueArtists = [...new Set(yearData.map(d => d.artist))];
    
    uniqueArtists.forEach(artist => {
      artistDataMap.set(artist, new Array(12).fill(0)); // Initialize 12 months with 0
    });

    // Fill Data
    yearData.forEach(d => {
      const currentArr = artistDataMap.get(d.artist);
      if (currentArr) {
        // Mongo months are 1-12, array is 0-11
        currentArr[d.month - 1] = d.total;
      }
    });

    this.artistChartData.datasets = Array.from(artistDataMap.entries()).map(([artist, values], index) => ({
      data: values,
      label: artist,
      borderColor: this.getColor(index),
      backgroundColor: this.getColor(index, 0.2),
      pointBackgroundColor: this.getColor(index),
      tension: 0.3,
      fill: false
    }));
  }

  processVenueChartData() {
    const yearData = this.rawVenueData.filter(d => d.year === this.selectedYear);

    // Transform keys
    const transformedData = yearData.map(d => ({
      ...d,
      venueKey: `${d.venueName} (${d.venueCity}, ${d.venueState})`
    }));

    this.venueChartData.labels = this.getMonthLabels();

    const venueMap = new Map<string, number[]>();
    const uniqueVenues = [...new Set(transformedData.map(d => d.venueKey))];

    uniqueVenues.forEach(v => venueMap.set(v, new Array(12).fill(0)));

    transformedData.forEach(d => {
      const arr = venueMap.get(d.venueKey);
      if (arr) {
        arr[d.month - 1] = d.total;
      }
    });

    this.venueChartData.datasets = Array.from(venueMap.entries()).map(([venue, values], index) => ({
      data: values,
      label: venue, 
      borderColor: this.getColor(index + 5), 
      backgroundColor: this.getColor(index + 5, 0.2),
      pointBackgroundColor: this.getColor(index + 5),
      tension: 0.3,
      fill: false
    }));
  }

  getColor(index: number, alpha: number = 1): string {
    const hues = [210, 145, 45, 280, 15, 180, 320, 90]; 
    const hue = hues[index % hues.length];
    return `hsla(${hue}, 70%, 60%, ${alpha})`;
  }
}