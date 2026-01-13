import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ArtistProfileService } from '../artist-profile.service';
import { AuthService } from '../../auth/auth.service';
import { Event, EventService } from '../../events/event.service';
import { Router } from '@angular/router';
import { CalendarComponent } from '../../../components/calendar/calendar.component';

@Component({
  selector: 'app-event-approval',
  standalone: true,
  imports: [CommonModule, DatePipe, CalendarComponent],
  templateUrl: './event-approval.component.html',
  styleUrl: './event-approval.component.scss'
})
export class EventApprovalComponent implements OnInit {
  profileService = inject(ArtistProfileService);
  authService = inject(AuthService);
  eventService = inject(EventService);
  router = inject(Router);

  pendingEvents: Event[] = [];
  approvedEvents: Event[] = [];
  allEvents: Event[] = []; // Combined for calendar

  ngOnInit() {
    if (this.authService.currentUser()?.userType !== 'artist') {
      alert('You are not authorized to view this page.');
      this.router.navigate(['/']);
      return;
    }
    this.loadEvents();
  }

  loadEvents() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.profileService.getArtistProfile(userId).subscribe(profile => {
        if (profile && profile._id) {
          this.eventService.getEventsForArtist(profile._id).subscribe(events => {
            this.pendingEvents = events.filter(e => e.status === 'pending');
            this.approvedEvents = events.filter(e => e.status === 'approved');
            this.allEvents = events; // Send both pending and approved to calendar
          });
        }
      });
    }
  }

  handleApproval(eventId: string, status: 'approved' | 'rejected') {
    this.eventService.updateEventStatus(eventId, status).subscribe(() => {
      alert(`Event has been ${status}.`);
      this.loadEvents();
    });
  }

  onCancel(eventId: string) {
    if (confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      this.eventService.cancelEvent(eventId).subscribe(() => {
        alert('Event has been canceled.');
        this.loadEvents();
      });
    }
  }

  daysUntil(date: string | Date): string {
    const eventDate = new Date(date).getTime();
    const today = new Date().getTime();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Event has passed';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `in ${diffDays} days`;
  }
}