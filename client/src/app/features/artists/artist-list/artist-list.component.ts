import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ArtistProfile, ArtistProfileService } from '../artist-profile.service';

@Component({
  selector: 'app-artist-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './artist-list.component.html',
  styleUrl: './artist-list.component.scss'
})
export class ArtistListComponent implements OnInit {
  artistProfileService = inject(ArtistProfileService);
  
  artistProfiles: ArtistProfile[] = [];
  filteredProfiles: ArtistProfile[] = [];
  searchTerm: string = '';

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles() {
    this.artistProfileService.getArtistProfiles().subscribe(profiles => {
      // Sort profiles alphabetically by artistName
      this.artistProfiles = profiles.sort((a, b) => a.artistName.localeCompare(b.artistName));
      this.filterArtists(); // Initialize filtered list
    });
  }

  filterArtists() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredProfiles = this.artistProfiles;
    } else {
      this.filteredProfiles = this.artistProfiles.filter(profile => 
        profile.artistName.toLowerCase().includes(term)
      );
    }
  }
}