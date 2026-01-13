import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistProfile, ArtistProfileService } from '../artist-profile.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-management.component.html',
  styleUrl: './profile-management.component.scss'
})
export class ProfileManagementComponent implements OnInit {
  authService = inject(AuthService);
  profileService = inject(ArtistProfileService);

  profile: Partial<ArtistProfile> = {
    artistName: '',
    bio: '',
    imageUrl: ''
  };

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.profileService.getArtistProfile(userId).subscribe(profile => {
        if (profile) {
          this.profile = profile;
        }
      });
    }
  }

  onProfileSubmit() {
    const userId = this.authService.currentUser()?.id;
    if (userId && this.profile.artistName) {
      const profileData = { ...this.profile, user: userId };
      this.profileService.saveArtistProfile(profileData).subscribe(savedProfile => {
        this.profile = savedProfile;
        alert('Profile saved successfully!');
      });
    }
  }
}