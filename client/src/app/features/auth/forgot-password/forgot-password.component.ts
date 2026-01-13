import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  username = '';
  router = inject(Router);

  onSubmit() {
    if (this.username) {
      this.router.navigate(['/auth/reset-password', this.username]);
    } else {
      alert('Please enter a username.');
    }
  }
}