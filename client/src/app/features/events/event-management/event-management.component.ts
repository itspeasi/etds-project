import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { EventService, Event } from '../event.service';
import { Venue, VenueService } from '../../venues/venue.service';
import { Performance, PerformanceService } from '../../artists/performance.service';

@Component({
  selector: 'app-event-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './event-management.component.html',
  styleUrl: './event-management.component.scss'
})
export class EventManagementComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  eventService = inject(EventService);
  venueService = inject(VenueService);
  performanceService = inject(PerformanceService);

  events: any[] = [];
  venues: Venue[] = [];
  performances: any[] = [];

  durationHours: number = 2;
  durationMinutes: number = 0;
  
  // State for editing
  editingEvent: Event | null = null;
  
  newEvent: any = {
    performance: '',
    venue: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '19:00',
    ticketPrice: null, // Initialized to null for placeholder to show
  };

  ngOnInit() {
    if (this.authService.currentUser()?.userType !== 'distributor') {
      alert('You are not authorized to view this page.');
      this.router.navigate(['/']);
      return;
    }
    this.loadInitialData();
  }

  loadInitialData() {
    const distributorId = this.authService.currentUser()?.id;
    this.eventService.getEvents(distributorId).subscribe(data => this.events = data);
    this.venueService.getVenues().subscribe(data => this.venues = data);
    this.performanceService.getAllPerformances().subscribe(data => this.performances = data);
  }

  // Helper to calculate end time for display
  get calculatedEndTime(): string {
    if (!this.newEvent.startTime) return '';
    
    const [hours, minutes] = this.newEvent.startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes + this.durationMinutes);
    date.setHours(date.getHours() + this.durationHours);

    // Format to HH:mm
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  onSubmit() {
    const selectedPerformance = this.performances.find(p => p._id === this.newEvent.performance);
    if (!selectedPerformance) {
      alert('Please select a valid performance.');
      return;
    }

    const eventDateStr = this.newEvent.date;
    const perfStartDateStr = new Date(selectedPerformance.startDate).toISOString().split('T')[0];
    const perfEndDateStr = new Date(selectedPerformance.endDate).toISOString().split('T')[0];

    if (eventDateStr < perfStartDateStr || eventDateStr > perfEndDateStr) {
      const proceed = confirm(
        'Warning: The selected event date is outside the performance\'s date range (' +
        `${perfStartDateStr} to ${perfEndDateStr}). Do you want to proceed anyway?`
      );
      if (!proceed) {
        return;
      }
    }
    
    if (this.editingEvent) {
      this.updateTheEvent();
    } else {
      this.createTheEvent();
    }
  }

  private createTheEvent() {
    const distributorId = this.authService.currentUser()?.id;
    if (!distributorId) {
      alert('Error: You must be logged in to create an event.');
      return;
    }

    const { performance, venue, date, startTime, ticketPrice } = this.newEvent;
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + (this.durationHours * 60 * 60 * 1000) + (this.durationMinutes * 60 * 1000));
    
    const eventToCreate = {
      performance,
      venue,
      startDateTime,
      endDateTime,
      distributor: distributorId,
      ticketPrice: ticketPrice || 0
    };

    this.eventService.createEvent(eventToCreate).subscribe({
      next: () => {
        alert('Event created successfully! It is now pending artist approval.');
        this.resetForm();
        this.loadInitialData();
      },
      error: (err) => {
        alert(`Error creating event: ${err.error.message}`);
      }
    });
  }

  private updateTheEvent() {
    if (!this.editingEvent || !this.editingEvent._id) return;

    const { performance, venue, date, startTime, ticketPrice } = this.newEvent;
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime.getTime() + (this.durationHours * 60 * 60 * 1000) + (this.durationMinutes * 60 * 1000));

    const eventToUpdate = {
      performance,
      venue,
      startDateTime,
      endDateTime,
      ticketPrice
    };

    this.eventService.updateEvent(this.editingEvent._id, eventToUpdate).subscribe({
      next: () => {
        alert('Event updated successfully.');
        this.resetForm();
        this.loadInitialData();
      },
      error: (err) => {
        alert(`Error updating event: ${err.error.message}`);
      }
    });
  }

  onEdit(event: any) {
    this.editingEvent = event;
    
    // Parse date and time from startDateTime
    const startDate = new Date(event.startDateTime);
    const dateStr = startDate.toISOString().split('T')[0];
    const timeStr = startDate.toTimeString().substring(0, 5); // HH:MM

    // Calculate duration
    const endDate = new Date(event.endDateTime);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    this.durationHours = hours;
    this.durationMinutes = minutes;

    this.newEvent = {
      performance: event.performance._id,
      venue: event.venue._id,
      date: dateStr,
      startTime: timeStr,
      ticketPrice: event.ticketPrice
    };
  }

  cancelEdit() {
    this.resetForm();
  }

  resetForm() {
    this.editingEvent = null;
    this.newEvent = {
      performance: '',
      venue: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '19:00',
      ticketPrice: null // Reset to null
    };
    this.durationHours = 2;
    this.durationMinutes = 0;
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this pending event?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {
          alert('Event deleted successfully.');
          this.loadInitialData();
        },
        error: (err) => {
          alert(`Error deleting event: ${err.error.message}`);
        }
      });
    }
  }

  onCancel(id: string) {
    if (confirm('Are you sure you want to cancel this approved event?')) {
      this.eventService.cancelEvent(id).subscribe({
        next: () => {
          alert('Event canceled successfully.');
          this.loadInitialData();
        },
        error: (err) => {
          alert(`Error canceling event: ${err.error.message}`);
        }
      });
    }
  }
}