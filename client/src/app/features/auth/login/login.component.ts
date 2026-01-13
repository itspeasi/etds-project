import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginData = { username: '', password: '' };

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.http.post<{ message: string; token: string; user: User }>('http://localhost:3001/api/auth/login', this.loginData).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        // Pass both user object and token to AuthService
        this.authService.login(response.user, response.token);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Login failed', error);
        alert('Login failed: ' + (error.error.message || 'Server error'));
      },
    });
  }
}