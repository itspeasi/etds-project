import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Venue, VenueService } from '../venue.service';

@Component({
  selector: 'app-venue-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './venue-list.component.html',
  styleUrl: './venue-list.component.scss'
})
export class VenueListComponent implements OnInit {
  venueService = inject(VenueService);
  
  venues: Venue[] = [];
  filteredVenues: Venue[] = [];
  searchTerm: string = '';

  ngOnInit() {
    this.venueService.getVenues().subscribe(data => {
      this.venues = data.sort((a, b) => a.name.localeCompare(b.name));
      this.filterVenues();
    });
  }

  filterVenues() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredVenues = this.venues;
    } else {
      this.filteredVenues = this.venues.filter(venue => 
        venue.name.toLowerCase().includes(term) ||
        venue.city.toLowerCase().includes(term) ||
        venue.state.toLowerCase().includes(term)
      );
    }
  }
}