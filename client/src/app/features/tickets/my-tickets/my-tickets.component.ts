import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { TicketService, Ticket } from '../ticket.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { toDataURL } from 'qrcode';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.scss'
})
export class MyTicketsComponent implements OnInit {
  ticketService = inject(TicketService);
  authService = inject(AuthService);
  router = inject(Router);
  
  tickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  qrCodeUrl: string = '';
  
  // Pagination
  currentPage = 1;
  limit = 20;
  hasMore = true;
  loading = false;

  ngOnInit() {
    const user = this.authService.currentUser();
    if (!user || user.userType !== 'customer') {
      this.router.navigate(['/']);
      return;
    }
    this.loadTickets(user.id);
  }

  loadTickets(userId: string) {
    this.loading = true;
    this.ticketService.getMyTickets(userId, this.currentPage, this.limit).subscribe({
      next: (data) => {
        if (data.length < this.limit) {
          this.hasMore = false;
        }
        this.tickets = [...this.tickets, ...data];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tickets', err);
        this.loading = false;
      }
    });
  }

  loadMore() {
    const user = this.authService.currentUser();
    if (user) {
      this.currentPage++;
      this.loadTickets(user.id);
    }
  }

  async openTicketModal(ticket: Ticket) {
    this.selectedTicket = ticket;
    try {
      // Generate QR code as a Data URL
      this.qrCodeUrl = await toDataURL(ticket._id, { width: 200, margin: 1 });
    } catch (err) {
      console.error('Error generating QR code', err);
      this.qrCodeUrl = '';
    }
  }

  closeModal() {
    this.selectedTicket = null;
    this.qrCodeUrl = '';
  }
}