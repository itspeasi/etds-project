import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AdminService } from '../admin.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  adminService = inject(AdminService);
  authService = inject(AuthService);
  router = inject(Router);

  collectionNames: string[] = [];

  ngOnInit() {
    if (this.authService.currentUser()?.userType !== 'admin') {
      alert('You are not authorized to view this page.');
      this.router.navigate(['/']);
      return;
    }

    this.loadCollections();
  }

  loadCollections() {
    this.adminService.getCollectionNames().subscribe(names => {
      this.collectionNames = names.sort();
    });
  }

  exportAllCollections() {
    this.adminService.exportAllCollections().subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = 'collections.zip';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(objectUrl);
      document.body.removeChild(a);
    });
  }

  resetDb() {
    if (confirm('WARNING: This will delete ALL data and reset it to the initial seed state. Are you sure?')) {
      this.adminService.resetDatabase().subscribe({
        next: (res: any) => {
          alert(res.message);
          this.loadCollections(); // Refresh list
        },
        error: (err: any) => alert(err.error.message)
      });
    }
  }

  clearDb() {
    if (confirm('DANGER: This will delete ALL data in the system. This cannot be undone. Are you sure?')) {
      this.adminService.clearDatabase().subscribe({
        next: (res: any) => {
          alert(res.message);
          this.loadCollections(); // Refresh list (should be empty)
        },
        error: (err: any) => alert(err.error.message)
      });
    }
  }
}