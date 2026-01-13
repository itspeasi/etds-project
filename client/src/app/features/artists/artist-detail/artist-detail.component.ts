import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ArtistProfile, ArtistProfileService } from '../artist-profile.service';
import { Performance } from '../performance.service';
import { Event } from '../../events/event.service';
import { CalendarComponent } from '../../../components/calendar/calendar.component';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, CalendarComponent],
  templateUrl: './artist-detail.component.html',
  styleUrl: './artist-detail.component.scss'
})
export class ArtistDetailComponent implements OnInit {
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;

  private route = inject(ActivatedRoute);
  private artistProfileService = inject(ArtistProfileService);

  artistProfile: ArtistProfile | null = null;
  performances: Performance[] = [];
  allEvents: Event[] = []; // Aggregated events for calendar
  loading = true;

  ngOnInit() {
    const profileId = this.route.snapshot.paramMap.get('id');
    if (profileId) {
      this.artistProfileService.getArtistProfileWithPerformances(profileId).subscribe(data => {
        this.artistProfile = data.profile;
        this.performances = data.performances;
        
        // Flatten all events from performances into a single array for the calendar
        this.allEvents = this.performances.flatMap(p => {
          return (p.events || []).map(e => ({
            ...e,
            performance: p
          }));
        });

        this.loading = false;
      });
    }
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

  isEventInFuture(event: Event): boolean {
    return new Date(event.startDateTime) > new Date();
  }

  isSoldOut(event: Event): boolean {
    return (event.ticketsSold || 0) >= event.venue.capacity;
  }

  // Method to scroll to calendar and select the date
  jumpToCalendar(event: Event) {
    if (this.calendarComponent) {
      this.calendarComponent.navigateToDate(event.startDateTime);
      // Smooth scroll to the calendar section
      const calendarEl = document.getElementById('event-calendar');
      if (calendarEl) {
        calendarEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
}