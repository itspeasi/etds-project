import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-collection-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, JsonPipe, FormsModule],
  templateUrl: './collection-viewer.component.html',
  styleUrl: './collection-viewer.component.scss'
})
export class CollectionViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);
  private router = inject(Router);

  collectionName = '';
  collectionData: any[] = [];
  headers: string[] = [];
  loading = true;

  // Pagination state
  currentPage = 1;
  pageSize = 50;
  totalItems = 0;
  totalPages = 0;

  ngOnInit() {
    // Listen to both Route Params (collection name) and Query Params (page number)
    combineLatest([
      this.route.paramMap,
      this.route.queryParamMap
    ]).subscribe(([params, queryParams]) => {
      this.collectionName = params.get('collectionName') || '';
      
      // Parse page from URL, default to 1
      const pageParam = parseInt(queryParams.get('page') || '1', 10);
      this.currentPage = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;

      if (this.collectionName) {
        this.loadCollectionData();
      }
    });
  }

  loadCollectionData() {
    this.loading = true;
    this.adminService.getCollectionData(this.collectionName, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.collectionData = response.data;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        
        if (this.collectionData.length > 0) {
          this.headers = Object.keys(this.collectionData[0]);
        } else {
          this.headers = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load collection data', err);
        this.loading = false;
      }
    });
  }

  // Update URL to trigger reload via subscription
  updateUrl() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge', // Preserves other params if any
    });
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateUrl();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateUrl();
    }
  }

  goToPage(pageInput: string | number) {
    let page = typeof pageInput === 'string' ? parseInt(pageInput, 10) : pageInput;
    
    // Validate input
    if (isNaN(page) || page < 1) {
      page = 1;
    } else if (this.totalPages > 0 && page > this.totalPages) {
      page = this.totalPages;
    }

    // Only update if changed
    if (page !== this.currentPage) {
      this.currentPage = page;
      this.updateUrl();
    } else {
      // If invalid input was typed but it maps to current page (e.g. typing '0' when on page 1),
      // force reload to reset the input field value in UI
      this.currentPage = page; 
      // Manually calling load isn't strictly necessary if view is bound, but ensures sync
    }
  }

  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }

  exportAsJson() {
    if (this.collectionData.length === 0) {
      return;
    }

    const jsonString = JSON.stringify(this.collectionData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.collectionName}_page${this.currentPage}.json`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  deleteCollection() {
    if (confirm(`Are you sure you want to permanently delete the '${this.collectionName}' collection? This action cannot be undone.`)) {
      this.adminService.deleteCollection(this.collectionName).subscribe({
        next: () => {
          alert(`Collection '${this.collectionName}' has been deleted.`);
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          alert(`Failed to delete collection: ${err.error.message}`);
        }
      });
    }
  }
}