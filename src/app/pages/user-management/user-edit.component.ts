import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// 1. Import Module của NG-ZORRO để dùng Select nhiều
import { NzSelectModule } from 'ng-zorro-antd/select'; 
import { UserService, UserUpdateRequest } from '../../services/user.service';
import { RoleService, Role } from '../../services/role.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule], // 2. Thêm NzSelectModule vào đây
  template: `
    <h2>Sửa người dùng</h2>
    <form *ngIf="form" (ngSubmit)="onSubmit()" class="user-form">
      <div class="form-group">
        <label>Tên đăng nhập:</label>
        <input [(ngModel)]="form.username" name="username" disabled class="disabled-input" />
      </div>

      <div class="form-group">
        <label>Email:</label>
        <input [(ngModel)]="form.email" name="email" required />
      </div>

      <div class="form-group">
        <label>Vai trò (Có thể chọn nhiều):</label>
        <nz-select 
          nzMode="multiple" 
          nzPlaceHolder="Chọn các vai trò" 
          [(ngModel)]="form.roleIds" 
          name="roleIds">
          <nz-option *ngFor="let role of roles" [nzLabel]="role.name" [nzValue]="role.id"></nz-option>
        </nz-select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-save">Lưu thay đổi</button>
        <button type="button" class="btn-cancel" (click)="goToList()">Quay về</button>
      </div>
    </form>
  `,
  styles: [`
    /* Giữ nguyên CSS cũ của bạn, thêm style cho nz-select nếu cần */
    nz-select { width: 100%; }
    .user-form { max-width: 500px; background: #fff; padding: 24px; border-radius: 8px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
    .form-group input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
    .disabled-input { background: #f5f5f5; color: #888; cursor: not-allowed; }
    .form-actions { display: flex; gap: 10px; margin-top: 20px; }
    .btn-save { background: #1890ff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .btn-cancel { background: #f5f5f5; border: 1px solid #d9d9d9; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
  `]
})
export class UserEditComponent implements OnInit {
  form: any = null;
  roles: Role[] = [];
  id: string = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load danh sách Roles
    this.roleService.getRoles().subscribe(roles => this.roles = roles);

    this.id = this.route.snapshot.paramMap.get('id')!;
    if (this.id) {
      this.userService.getUserById(this.id).subscribe(u => {
        this.form = {
          username: u.username,
          email: u.email,
          // 4. Map danh sách roles object thành mảng ID: [1, 2, 5]
          roleIds: u.roles ? u.roles.map(r => r.id) : [] 
        };
      });
    }
  }

  onSubmit() {
    if (this.id && this.form) {
      const updateData: UserUpdateRequest = {
        email: this.form.email,
        roleIds: this.form.roleIds // Gửi mảng ID lên server
      };

      this.userService.updateUser(this.id, updateData).subscribe({
        next: () => {
          alert('Cập nhật thành công!');
          this.goToList();
        },
        error: (err) => console.error(err)
      });
    }
  }

  goToList() {
    this.router.navigate(['/user-management']);
  }
}