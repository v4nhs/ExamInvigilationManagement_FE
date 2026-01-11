import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { LecturerService, Page } from '../../services/lecturer.service';
import { UserService } from '../../services/user.service';
import { LecturerAddComponent } from './lecturer-add.component';
import { Lecturer } from '../../models/lecturer.models';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-lecturer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LecturerAddComponent, FormsModule],
  templateUrl: './lecturer-list.component.html',
  styleUrls: ['./lecturer-list.component.css']
})
export class LecturerListComponent implements OnInit {
  lecturers: Lecturer[] = [];
  filteredLecturers: Lecturer[] = [];
  loading = false;
  deleting: number | null = null;
  showAddForm = false;
  editingLecturerId: number | null = null;
  searchQuery: string = '';
  userEmailMap: Map<number, string> = new Map(); // Cache user emails

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'id';
  sortDirection: string = 'ASC';
  Math = Math;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  constructor(
    private lecturerService: LecturerService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Just fetch lecturers directly, backend should provide user.email
    this.fetchLecturersPaginated();
  }

  fetchLecturersPaginated() {
    this.loading = true;
    if (this.searchQuery.trim()) {
      this.lecturerService.searchLecturers(this.searchQuery, this.currentPage, this.pageSize).subscribe({
        next: (page: Page<Lecturer>) => this.handlePageResponse(page),
        error: () => this.handleError()
      });
    } else {
      this.lecturerService.getLecturersPaginated(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
        next: (page: Page<Lecturer>) => this.handlePageResponse(page),
        error: () => this.handleError()
      });
    }
  }

  handlePageResponse(page: Page<Lecturer>) {
    this.lecturers = page.content || [];
    this.filteredLecturers = this.lecturers;
    this.totalElements = page.totalElements;
    this.totalPages = page.totalPages;
    this.loading = false;
    
    // Log for debugging
    console.log('Lecturers loaded:', this.lecturers);
  }

  handleError() {
    this.loading = false;
  }

  fetchLecturers() {
    this.currentPage = 0;
    this.fetchLecturersPaginated();
  }

  openAddForm(id?: number) {
    this.editingLecturerId = id || null;
    this.showAddForm = true;
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingLecturerId = null;
  }

  onLecturerSaved() {
    this.closeAddForm();
    this.fetchLecturers();
  }

  onSearchChange() {
    this.currentPage = 0;
    this.fetchLecturersPaginated();
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.fetchLecturersPaginated();
  }

  getEmail(lecturer: Lecturer): string {
    // Try to get email from multiple sources
    console.log(`getEmail for ${lecturer.fullName}:`, {
      'user': lecturer.user,
      'user.email': lecturer.user?.email,
      'lecturer.email': lecturer.email,
      'lecturer object': lecturer
    });
    return lecturer.user?.email || lecturer.email || '-';
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchLecturersPaginated();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.fetchLecturersPaginated();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchLecturersPaginated();
    }
  }

  deleteLecturer(id: number) {
    if (!confirm('Bạn có chắc chắn muốn xóa giảng viên này?')) return;

    this.deleting = id;
    this.lecturerService.delete(id).subscribe({
      next: () => {
        this.deleting = null;
        this.notificationService.success('Xóa giảng viên thành công!');
        this.fetchLecturersPaginated();
      },
      error: (err) => {
        this.notificationService.error('Xóa giảng viên thất bại!');
        this.deleting = null;
        console.error(err);
      }
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible);
    
    if (endPage - startPage < maxVisible) {
      startPage = Math.max(0, endPage - maxVisible);
    }
    
    for (let i = startPage; i < endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.fetchLecturersPaginated();
  }
}
