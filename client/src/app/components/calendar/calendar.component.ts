import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Event, EventService } from '../../features/events/event.service';
import { AuthService } from '../../features/auth/auth.service';
import { TicketService } from '../../features/tickets/ticket.service';
import { Router } from '@angular/router';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
  isSelected: boolean;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnChanges, OnInit {
  @Input() events: Event[] = [];
  @Input() mode: 'public' | 'artist' = 'public';

  authService = inject(AuthService);
  ticketService = inject(TicketService);
  eventService = inject(EventService);
  router = inject(Router);

  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['events']) {
      this.generateCalendar();
    }
  }

  // Public method to be called by parent components
  public navigateToDate(dateInput: string | Date) {
    const targetDate = new Date(dateInput);
    
    // Switch the calendar view to the target month/year
    this.currentDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    this.generateCalendar();

    // Find the specific day object in the generated grid
    const targetDay = this.calendarDays.find(day => 
      day.isCurrentMonth && this.isSameDate(day.date, targetDate)
    );

    // Select it if found
    if (targetDay) {
      this.selectDay(targetDay);
    }
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

    this.calendarDays = [];

    // Previous month's padding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      this.calendarDays.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isToday: false,
        events: [],
        isSelected: false
      });
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = this.isSameDate(date, new Date());
      
      // Filter events for this day
      const dayEvents = this.events.filter(e => 
        this.isSameDate(new Date(e.startDateTime), date)
      );

      this.calendarDays.push({
        date: date,
        isCurrentMonth: true,
        isToday: isToday,
        events: dayEvents,
        isSelected: false
      });
    }

    // Next month's padding days
    const remainingCells = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingCells; i++) {
      this.calendarDays.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        isToday: false,
        events: [],
        isSelected: false
      });
    }

    // Re-select day if it's still visible in the new view
    if (this.selectedDay) {
      const found = this.calendarDays.find(d => this.isSameDate(d.date, this.selectedDay!.date));
      if (found) {
        this.selectDay(found);
      } else {
        this.selectedDay = null;
      }
    }
  }

  changeMonth(delta: number) {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + delta, 1);
    this.generateCalendar();
  }

  selectDay(day: CalendarDay) {
    this.calendarDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
    this.selectedDay = day;
  }

  isSameDate(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  isSoldOut(event: Event): boolean {
    return (event.ticketsSold || 0) >= event.venue.capacity;
  }

  isPast(event: Event): boolean {
    return new Date(event.startDateTime) < new Date();
  }

  buyTicket(event: Event) {
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

    const quantityStr = prompt(`How many tickets? ($${event.ticketPrice} each)`);
    if (!quantityStr) return;
    const quantity = parseInt(quantityStr, 10);
    
    if (isNaN(quantity) || quantity <= 0) {
      alert('Invalid quantity');
      return;
    }

    if (confirm(`Confirm purchase of ${quantity} tickets for total $${quantity * event.ticketPrice}?`)) {
      this.ticketService.purchaseTickets({
        eventId: event._id!,
        quantity,
        userId: user.id
      }).subscribe({
        next: (res) => {
          alert('Purchase successful!');
          event.ticketsSold = (event.ticketsSold || 0) + quantity;
        },
        error: (err) => alert(err.error.message)
      });
    }
  }
}