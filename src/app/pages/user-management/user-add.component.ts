import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserCreationRequest } from '../../services/user.service'; 
import { RoleService, Role } from '../../services/role.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [FormsModule, CommonModule, NzButtonModule, NzInputModule, NzSelectModule],
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form: UserCreationRequest = {
    username: '',
    password: '',
    firstName: 'User',
    lastName: 'New',
    email: '',
    roleIds: []
  };
  roles: Role[] = [];
  loading = false;

  constructor(
    private userService: UserService, 
    private roleService: RoleService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        console.log('Roles loaded for select:', this.roles);
      },
      error: (err) => {
        console.error('Không thể tải danh sách vai trò:', err);
        this.notificationService.error('Không thể tải danh sách vai trò!');
      }
    });
  }

  onSubmit() {
    this.loading = true;
    this.userService.createUser(this.form).subscribe({
      next: () => {
        this.notificationService.success('Thêm người dùng thành công!');
        this.loading = false;
        this.saved.emit();
        this.closeDialog();
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Lỗi khi lưu dữ liệu!';
        this.notificationService.error(errorMsg);
        this.loading = false;
      }
    });
  }

  onRoleChange(roleId: number, event: any) {
    if (event.target.checked) {
      if (!this.form.roleIds.includes(roleId)) {
        this.form.roleIds.push(roleId);
      }
    } else {
      this.form.roleIds = this.form.roleIds.filter(id => id !== roleId);
    }
  }

  closeDialog(): void {
    this.close.emit();
  }
}