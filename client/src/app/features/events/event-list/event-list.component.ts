import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Event, EventService } from '../event.service';
import { AuthService } from '../../auth/auth.service';
import { TicketService } from '../../tickets/ticket.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, FormsModule],
  templateUrl: './event-list.component.html',
  styleUrl: './event-list.component.scss'
})
export class EventListComponent implements OnInit {
  eventService = inject(EventService);
  authService = inject(AuthService);
  ticketService = inject(TicketService);
  router = inject(Router);
  
  events: Event[] = [];
  filteredEvents: Event[] = [];
  searchTerm: string = '';

  ngOnInit() {
    this.loadUpcomingEvents();
  }

  loadUpcomingEvents() {
    this.eventService.getUpcomingEvents().subscribe(data => {
      this.events = data;
      this.filterEvents();
    });
  }

  filterEvents() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredEvents = this.events;
    } else {
      this.filteredEvents = this.events.filter(event => 
        event.performance.performanceName.toLowerCase().includes(term) ||
        event.performance.artistProfile.artistName.toLowerCase().includes(term) ||
        event.venue.name.toLowerCase().includes(term)
      );
    }
  }

  isEventPast(event: Event): boolean {
    return new Date(event.startDateTime) < new Date();
  }

  buyTickets(event: Event) {
    const user = this.authService.currentUser();
    if (!user) {
      if (confirm('You need to be logged in to purchase tickets. Go to login?')) {
        this.router.navigate(['/auth/login']);
      }
      return;
    }

    if (user.userType !== 'customer') {
      alert('Only customers can purchase tickets.');
      return;
    }

    const quantityStr = prompt(`How many tickets would you like to buy for ${event.performance.performanceName}?\nPrice per ticket: $${event.ticketPrice}`);
    if (!quantityStr) return;

    const quantity = parseInt(quantityStr, 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    if (confirm(`Confirm purchase of ${quantity} ticket(s) for a total of $${quantity * event.ticketPrice}?`)) {
      this.ticketService.purchaseTickets({
        eventId: event._id!,
        quantity,
        userId: user.id
      }).subscribe({
        next: (res) => {
          alert('Tickets purchased successfully! Transaction ID: ' + res.transactionId);
          this.router.navigate(['/my-tickets']);
        },
        error: (err) => {
          alert('Purchase failed: ' + err.error.message);
        }
      });
    }
  }
}