import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  username: string | null = '';
  newPassword = '';

  route = inject(ActivatedRoute);
  http = inject(HttpClient);
  router = inject(Router);

  ngOnInit() {
    this.username = this.route.snapshot.paramMap.get('username');
  }

  onSubmit() {
    if (!this.newPassword) {
      alert('Please enter a new password.');
      return;
    }
    this.http.post('http://localhost:3001/api/auth/reset-password', { username: this.username, newPassword: this.newPassword }).subscribe({
      next: (res) => {
        alert('Password has been updated successfully! Please log in.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        alert('Failed to update password: ' + err.error.message);
      }
    });
  }
}