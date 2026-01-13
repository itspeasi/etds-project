import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ProfileManagementComponent } from '../../artists/profile-management/profile-management.component';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, ProfileManagementComponent],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss',
})
export class PreferencesComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  user = this.authService.currentUser;

  goToResetPassword() {
    const currentUser = this.user();
    if (currentUser) {
      this.router.navigate(['/auth/reset-password'], { state: { username: currentUser.username } });
    }
  }

  deleteAccount() {
    const currentUser = this.user();
    if (!currentUser) return;

    if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      this.authService.deleteAccount(currentUser.id).subscribe({
        next: () => {
          alert('Your account has been deleted.');
          this.authService.logout();
        },
        error: (err) => {
          alert('Failed to delete account: ' + (err.error.message || 'Unknown error'));
        }
      });
    }
  }
}