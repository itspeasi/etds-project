import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { PreferencesComponent } from './features/auth/preferences/preferences.component';
import { VenueManagementComponent } from './features/venues/venue-management/venue-management.component';
import { ArtistListComponent } from './features/artists/artist-list/artist-list.component';
import { ArtistDetailComponent } from './features/artists/artist-detail/artist-detail.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { CollectionViewerComponent } from './features/admin/collection-viewer/collection-viewer.component';
import { EventManagementComponent } from './features/events/event-management/event-management.component';
import { PerformanceManagementComponent } from './features/artists/performance-management/performance-management.component';
import { EventApprovalComponent } from './features/artists/event-approval/event-approval.component';
import { EventListComponent } from './features/events/event-list/event-list.component';
import { MyTicketsComponent } from './features/tickets/my-tickets/my-tickets.component';
import { VenueListComponent } from './features/venues/venue-list/venue-list.component';
import { VenueDetailComponent } from './features/venues/venue-detail/venue-detail.component';
import { TopArtistsComponent } from './features/analytics/top-artists/top-artists.component';
import { DistributorDashboardComponent } from './features/distributors/dashboard/dashboard.component';
import { ArtistDashboardComponent } from './features/artists/dashboard/dashboard.component';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Routes
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'artists', component: ArtistListComponent },
  { path: 'artists/:id', component: ArtistDetailComponent },
  { path: 'top-artists', component: TopArtistsComponent },
  { path: 'events', component: EventListComponent },
  { path: 'venues', component: VenueListComponent },
  { path: 'venues/:id', component: VenueDetailComponent },
  
  // Auth Routes
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent }, // Kept public for flow, logic handled inside component via token usually, or simple username flow here
  
  // Protected Routes (Any Logged In User)
  { 
    path: 'preferences', 
    component: PreferencesComponent, 
    canActivate: [authGuard] 
  },

  // Customer Routes
  { 
    path: 'my-tickets', 
    component: MyTicketsComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['customer'] } 
  },

  // Distributor Routes
  { 
    path: 'manage-venues', 
    component: VenueManagementComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['distributor'] } 
  },
  { 
    path: 'manage-events', 
    component: EventManagementComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['distributor'] } 
  },
  { 
    path: 'distributor-dashboard', 
    component: DistributorDashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['distributor'] } 
  },

  // Artist Routes
  { 
    path: 'artist-dashboard', 
    component: ArtistDashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['artist'] } 
  },
  { 
    path: 'manage-performances', 
    component: PerformanceManagementComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['artist'] } 
  },
  { 
    path: 'my-events', 
    component: EventApprovalComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['artist'] } 
  },

  // Admin Routes
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['admin'] } 
  },
  { 
    path: 'admin/collections/:collectionName', 
    component: CollectionViewerComponent, 
    canActivate: [roleGuard], 
    data: { roles: ['admin'] } 
  },
];