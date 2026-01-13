import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Venue, VenueService } from '../venue.service';
import { Event, EventService } from '../../events/event.service';
import { CalendarComponent } from '../../../components/calendar/calendar.component';

@Component({
  selector: 'app-venue-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CalendarComponent],
  templateUrl: './venue-detail.component.html',
  styleUrl: './venue-detail.component.scss'
})
export class VenueDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private venueService = inject(VenueService);
  private eventService = inject(EventService);

  venue: Venue | null = null;
  events: Event[] = [];
  loading = true;

  ngOnInit() {
    const venueId = this.route.snapshot.paramMap.get('id');
    if (venueId) {
      // Load venue details
      this.venueService.getVenue(venueId).subscribe(venue => {
        this.venue = venue;
      });

      // Load events for this venue
      this.eventService.getEventsByVenue(venueId).subscribe(events => {
        this.events = events;
        this.loading = false;
      });
    }
  }
}