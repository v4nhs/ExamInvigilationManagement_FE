import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <h2>Danh sách người dùng</h2>
    <table class="user-table">
      <thead>
        <tr>
          <th>Tên đăng nhập</th>
          <th>Email</th>
          <th>Vai trò</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of users">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          
          <td>
            <span *ngFor="let role of user.roles; let last = last">
              {{ role.name }}<span *ngIf="!last">, </span>
            </span>
          </td>

          <td>
            <button class="btn-edit" (click)="editUser(user)">Sửa</button>
            <button class="btn-delete" (click)="deleteUser(user)">Xoá</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    // 1. Lắng nghe dữ liệu thay đổi từ Service (Subject)
    this.userService.users$.subscribe(data => {
      this.users = data;
    });

    // 2. SỬA QUAN TRỌNG: Gọi hàm loadUsers() thay vì gọi trực tiếp service
    // Để logic xử lý lỗi bên dưới được kích hoạt
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        if (Array.isArray(data)) this.users = data;
        else if (data && Array.isArray((data as any).result)) this.users = (data as any).result;
        else this.users = [];
      },
      error: (err) => {
        // Kiểm tra nếu là lỗi do chưa đăng nhập (401 hoặc thiếu token)
        if (err.status === 401 || err.message === 'No refresh token available') {
          // Xóa dữ liệu rác và chuyển về login
          localStorage.clear();
          this.router.navigate(['/login']);
          return; // Dừng lại, không in lỗi ra console nữa
        }
        if (err.message === 'No refresh token available' || err.status === 401) {
          return; 
        }
        // Chỉ in lỗi ra console nếu đó là lỗi khác (ví dụ: lỗi mạng, lỗi server 500)
        console.error('Lỗi tải danh sách:', err);
      }
    });
  }

  editUser(user: User) {
    this.router.navigate(['/user-management', user.id, 'edit']);
  }

  deleteUser(user: User) {
    if (confirm(`Xóa ${user.username}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => alert('Xóa thành công!')
      });
    }
  }
}