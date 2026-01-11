import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoleService, Role, Page } from '../../services/role.service';
import { NotificationService } from '../../services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  loading = false;
  searchQuery: string = '';

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'id';
  sortDirection: string = 'DESC';
  Math = Math;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  constructor(
    private roleService: RoleService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadRolesPaginated();
  }

  loadRolesPaginated() {
    this.loading = true;
    if (this.searchQuery.trim()) {
      this.roleService.searchRoles(this.searchQuery, this.currentPage, this.pageSize).subscribe({
        next: (page: Page<Role>) => this.handlePageResponse(page),
        error: (err) => this.handleError(err)
      });
    } else {
      this.roleService.getRolesPaginated(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
        next: (page: Page<Role>) => this.handlePageResponse(page),
        error: (err) => this.handleError(err)
      });
    }
  }

  handlePageResponse(page: Page<Role>) {
    this.roles = page.content || [];
    this.filteredRoles = this.roles;
    this.totalElements = page.totalElements;
    this.totalPages = page.totalPages;
    this.loading = false;
  }

  handleError(err: any) {
    this.loading = false;
    console.error('Lỗi tải danh sách vai trò:', err);
  }

  loadRoles() {
    this.currentPage = 0;
    this.loadRolesPaginated();
  }

  onSearchChange() {
    this.currentPage = 0;
    this.loadRolesPaginated();
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadRolesPaginated();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadRolesPaginated();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadRolesPaginated();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadRolesPaginated();
    }
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
    this.loadRolesPaginated();
  }
}