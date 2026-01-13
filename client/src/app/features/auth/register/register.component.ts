import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  registerData = { username: '', password: '', userType: 'customer' };
  userTypes = ['customer', 'distributor', 'artist', 'admin'];

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.http.post('http://localhost:3001/api/auth/register', this.registerData).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        alert('Registration successful! Please login.');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Registration failed', error);
        alert('Registration failed: ' + error.error.message);
      },
    });
  }
}