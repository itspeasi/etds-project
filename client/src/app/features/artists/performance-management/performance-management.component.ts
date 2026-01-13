import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Performance, PerformanceService } from '../performance.service';
import { ArtistProfile, ArtistProfileService } from '../artist-profile.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-performance-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './performance-management.component.html',
  styleUrl: './performance-management.component.scss'
})
export class PerformanceManagementComponent implements OnInit {
  performanceService = inject(PerformanceService);
  profileService = inject(ArtistProfileService);
  authService = inject(AuthService);

  artistProfile: ArtistProfile | null = null;
  performances: Performance[] = [];
  currentPerformance: Partial<Performance> = this.getInitialPerformanceState();
  editingPerformance: Performance | null = null;

  ngOnInit() {
    this.loadArtistProfileAndPerformances();
  }

  getInitialPerformanceState(): Partial<Performance> {
    const today = new Date().toISOString().split('T')[0];
    return { performanceName: '', startDate: today, endDate: today, isActive: true };
  }

  loadArtistProfileAndPerformances() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.profileService.getArtistProfile(userId).subscribe(profile => {
        if (profile) {
          this.artistProfile = profile;
          this.performanceService.getPerformances(profile._id!).subscribe(performances => {
            this.performances = performances;
          });
        }
      });
    }
  }

  onPerformanceSubmit() {
    if (!this.artistProfile) {
      alert('You must create an artist profile first.');
      return;
    }

    const performanceData = { ...this.currentPerformance, artistProfile: this.artistProfile._id };

    if (this.editingPerformance) {
      this.performanceService.updatePerformance(this.editingPerformance._id!, performanceData).subscribe(() => {
        this.loadArtistProfileAndPerformances();
        this.cancelEdit();
      });
    } else {
      this.performanceService.createPerformance(performanceData).subscribe(() => {
        this.loadArtistProfileAndPerformances();
        this.currentPerformance = this.getInitialPerformanceState();
      });
    }
  }

  onEdit(performance: Performance) {
    this.editingPerformance = performance;
    this.currentPerformance = {
      ...performance,
      startDate: new Date(performance.startDate).toISOString().split('T')[0],
      endDate: new Date(performance.endDate).toISOString().split('T')[0]
    };
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this performance?')) {
      this.performanceService.deletePerformance(id).subscribe(() => {
        this.loadArtistProfileAndPerformances();
      });
    }
  }

  cancelEdit() {
    this.editingPerformance = null;
    this.currentPerformance = this.getInitialPerformanceState();
  }

  onToggleActive(performance: Performance) {
    const updatedPerformance = { ...performance, isActive: !performance.isActive };
    this.performanceService.updatePerformance(performance._id!, updatedPerformance).subscribe(() => {
      this.loadArtistProfileAndPerformances();
    });
  }

  getPerformanceStatus(perf: Performance): 'Active' | 'Inactive' | 'Upcoming' {
    if (!perf.isActive) {
      return 'Inactive';
    }
    const now = new Date();
    const start = new Date(perf.startDate);
    const end = new Date(perf.endDate);

    if (now < start) {
      return 'Upcoming';
    } else if (now >= start && now <= end) {
      return 'Active';
    } else {
      return 'Inactive';
    }
  }
}