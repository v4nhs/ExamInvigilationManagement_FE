import { Component, OnInit } from '@angular/core';
import { UserService, User, Page } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { UserAddComponent } from './user-add.component';
import { UserEditModalComponent } from './user-edit-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UserAddComponent, UserEditModalComponent, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  deleting: string | null = null;
  showAddForm = false;
  showEditForm = false;
  editingUserId: number | null = null;
  selectedUser: User | null = null;
  searchQuery: string = '';

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  usePagination: boolean = true;
  sortBy: string = 'id';
  sortDirection: string = 'ASC';
  Math = Math;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  constructor(
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.loadUsersPaginated();
  }

  loadUsersPaginated() {
    this.loading = true;
    if (this.searchQuery.trim()) {
      this.userService.searchUsers(this.searchQuery, this.currentPage, this.pageSize).subscribe({
        next: (page: Page<User>) => this.handlePageResponse(page),
        error: (err) => this.handleError(err)
      });
    } else {
      this.userService.getUsersPaginated(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
        next: (page: Page<User>) => this.handlePageResponse(page),
        error: (err) => this.handleError(err)
      });
    }
  }

  handlePageResponse(page: Page<User>) {
    this.users = page.content || [];
    this.filteredUsers = this.users;
    this.totalElements = page.totalElements;
    this.totalPages = page.totalPages;
    this.loading = false;
  }

  handleError(err: any) {
    this.loading = false;
    if (err.status === 401 || err.message === 'No refresh token available') {
      localStorage.clear();
      this.router.navigate(['/login']);
      return;
    }
    console.error('Lỗi tải danh sách:', err);
  }

  loadUsers() {
    this.currentPage = 0;
    this.loadUsersPaginated();
  }

  openAddForm(id?: string | number) {
    this.editingUserId = id ? Number(id) : null;
    this.showAddForm = true;
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingUserId = null;
  }

  openEditForm(userId?: number) {
    if (userId !== undefined) {
      this.editingUserId = userId;
    }
    this.showEditForm = true;
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editingUserId = null;
    this.selectedUser = null;
  }

  onUserSaved() {
    this.closeAddForm();
    this.closeEditForm();
    this.loadUsers();
  }

  onSearchChange() {
    this.currentPage = 0;
    this.loadUsersPaginated();
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadUsersPaginated();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsersPaginated();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsersPaginated();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUsersPaginated();
    }
  }

  editUser(user: User) {
    console.log('Editing user:', user);
    this.selectedUser = user;
    this.editingUserId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    this.openEditForm();
  }

  deleteUser(user: User) {
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.username}"?`);
    if (!confirmed) return;

    this.deleting = user.id;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.deleting = null;
        this.loadUsersPaginated();
      },
      error: (err) => {
        alert('Xóa người dùng thất bại!');
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
    this.loadUsersPaginated();
  }
}