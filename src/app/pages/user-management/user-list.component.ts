import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserAddComponent } from './user-add.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, UserAddComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  deleting: string | null = null;
  showAddForm = false;
  editingUserId: number | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private message: NzMessageService
  ) { }

  ngOnInit() {
    this.userService.users$.subscribe(data => {
      this.users = data;
    });
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => {
        if (Array.isArray(data)) this.users = data;
        else if (data && Array.isArray((data as any).result)) this.users = (data as any).result;
        else this.users = [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401 || err.message === 'No refresh token available') {
          localStorage.clear();
          this.router.navigate(['/login']);
          return;
        }
        console.error('Lỗi tải danh sách:', err);
      }
    });
  }

  openAddForm() {
    this.editingUserId = null;
    this.showAddForm = true;
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingUserId = null;
  }

  onUserSaved() {
    this.closeAddForm();
    this.loadUsers();
  }  editUser(user: User) {
    this.router.navigate(['/user-management', user.id, 'edit']);
  }

  deleteUser(user: User) {
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.username}"?`);
    if (!confirmed) return;

    this.deleting = user.id;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.deleting = null;
      },
      error: (err) => {
        alert('Xóa người dùng thất bại!');
        this.deleting = null;
        console.error(err);
      }
    });
  }
}