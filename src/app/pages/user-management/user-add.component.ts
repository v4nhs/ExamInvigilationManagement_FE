import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserCreationRequest } from '../../services/user.service'; 
import { RoleService, Role } from '../../services/role.service';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
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
  @Input() editUserId: number | null = null;

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
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.loadRoles();
    if (this.editUserId) {
      this.loadUser(this.editUserId);
    }
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        console.log('Roles loaded for select:', this.roles);
      },
      error: (err) => {
        console.error('Không thể tải danh sách vai trò:', err);
        this.message.error('Không thể tải danh sách vai trò!');
      }
    });
  }

  loadUser(id: number) {
    this.loading = true;
    // For now, we'll just clear and not load - UserService doesn't have getUser method
    // In the future, implement getUser or use the edit button differently
    this.loading = false;
  }

  onSubmit() {
    this.loading = true;
    const request = this.editUserId
      ? this.userService.updateUser(String(this.editUserId), this.form)
      : this.userService.createUser(this.form);

    request.subscribe({
      next: () => {
        this.message.success(this.editUserId ? 'Cập nhật thành công!' : 'Thêm người dùng thành công!');
        this.loading = false;
        this.saved.emit();
        this.closeDialog();
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Lỗi khi lưu dữ liệu!';
        this.message.error(errorMsg);
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