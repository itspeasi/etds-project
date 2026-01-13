import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Venue, VenueService } from '../venue.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-venue-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venue-management.component.html',
  styleUrl: './venue-management.component.scss'
})
export class VenueManagementComponent implements OnInit {
  venueService = inject(VenueService);
  authService = inject(AuthService);
  router = inject(Router);

  venues: Venue[] = [];
  currentVenue: Venue = this.getInitialVenueState();
  editingVenue: Venue | null = null;

  ngOnInit() {
    // Basic authorization check
    if (this.authService.currentUser()?.userType !== 'distributor') {
      alert('You are not authorized to view this page.');
      this.router.navigate(['/']);
      return;
    }
    this.loadVenues();
  }

  getInitialVenueState(): Venue {
    return { name: '', address: '', city: '', state: '', zip: '', capacity: 0 };
  }

  loadVenues() {
    this.venueService.getVenues().subscribe(data => {
      this.venues = data;
    });
  }

  onSubmit() {
    if (this.editingVenue) {
      // Update existing venue
      this.venueService.updateVenue(this.editingVenue._id!, this.currentVenue).subscribe(() => {
        this.loadVenues();
        this.cancelEdit();
      });
    } else {
      // Create new venue
      this.venueService.createVenue(this.currentVenue).subscribe(() => {
        this.loadVenues();
        this.currentVenue = this.getInitialVenueState();
      });
    }
  }

  onEdit(venue: Venue) {
    this.editingVenue = venue;
    // Create a copy for editing to avoid mutating the list directly
    this.currentVenue = { ...venue };
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this venue?')) {
      this.venueService.deleteVenue(id).subscribe(() => {
        this.loadVenues();
      });
    }
  }

  cancelEdit() {
    this.editingVenue = null;
    this.currentVenue = this.getInitialVenueState();
  }
}