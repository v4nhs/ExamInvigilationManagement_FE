import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { DepartmentService, Page } from '../../services/department.service';
import { DepartmentAddComponent } from './department-add.component';
import { Department } from '../../models/department.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DepartmentAddComponent, FormsModule],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css']
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  filteredDepartments: Department[] = [];
  loading = false;
  error = '';
  deleting: number | null = null;
  showAddForm = false;
  editingDepartmentId: number | null = null;
  searchQuery: string = '';

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
    private departmentService: DepartmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.fetchDepartmentsPaginated();
  }

  fetchDepartmentsPaginated() {
    this.loading = true;
    if (this.searchQuery.trim()) {
      this.departmentService.searchDepartments(this.searchQuery, this.currentPage, this.pageSize).subscribe({
        next: (page: Page<Department>) => this.handlePageResponse(page),
        error: () => this.handleError()
      });
    } else {
      this.departmentService.getDepartmentsPaginated(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
        next: (page: Page<Department>) => this.handlePageResponse(page),
        error: () => this.handleError()
      });
    }
  }

  handlePageResponse(page: Page<Department>) {
    this.departments = page.content || [];
    this.filteredDepartments = this.departments;
    this.totalElements = page.totalElements;
    this.totalPages = page.totalPages;
    this.loading = false;
  }

  handleError() {
    this.error = 'Không thể tải danh sách khoa';
    this.loading = false;
  }

  fetchDepartments() {
    this.currentPage = 0;
    this.fetchDepartmentsPaginated();
  }

  openAddForm(id?: number) {
    this.editingDepartmentId = id || null;
    this.showAddForm = true;
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingDepartmentId = null;
  }

  onDepartmentSaved() {
    this.closeAddForm();
    this.fetchDepartments();
  }

  onSearchChange() {
    this.currentPage = 0;
    this.fetchDepartmentsPaginated();
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.fetchDepartmentsPaginated();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchDepartmentsPaginated();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.fetchDepartmentsPaginated();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchDepartmentsPaginated();
    }
  }

  deleteDepartment(id: number) {
    if (!id) {
      this.notificationService.error('ID khoa không hợp lệ');
      return;
    }
    const confirmed = confirm('Bạn có chắc chắn muốn xóa khoa này?');
    if (!confirmed) return;

    this.deleting = id;
    this.departmentService.delete(id).subscribe({
      next: () => {
        this.deleting = null;
        this.notificationService.success('Xóa khoa thành công!');
        this.fetchDepartmentsPaginated();
      },
      error: (err) => {
        this.notificationService.error('Xóa khoa thất bại!');
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
    this.fetchDepartmentsPaginated();
  }
}
