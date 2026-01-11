import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserCreationRequest, User } from '../../services/user.service'; 
import { RoleService, Role } from '../../services/role.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [FormsModule, CommonModule, NzButtonModule, NzInputModule, NzSelectModule],
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.css']
})
export class UserEditModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Input() userId: number | null = null;
  @Input() user: any = null;

  form: UserCreationRequest = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    roleIds: []
  };
  roles: Role[] = [];
  loading = true;
  dataLoaded = false;

  constructor(
    private userService: UserService, 
    private roleService: RoleService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadRoles();
    if (this.user) {
      // Nếu user data được truyền từ parent component, dùng luôn
      this.populateFormWithUserData(this.user);
    } else if (this.userId) {
      // Nếu chỉ có userId, gọi API
      this.loadUser(this.userId);
    } else {
      this.loading = false;
    }
  }

  populateFormWithUserData(userData: any) {
    console.log('Populating form with user data:', userData);
    console.log('User ID:', userData.id, 'Type:', typeof userData.id);
    console.log('Username:', userData.username);
    this.form = {
      username: userData.username || '',
      password: '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      roleIds: userData.roles ? userData.roles.map((r: any) => r.id) : []
    };
    this.loading = false;
    this.dataLoaded = true;
    console.log('Form populated:', this.form);
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        this.dataLoaded = true;
        console.log('Roles loaded for select:', this.roles);
      },
      error: (err) => {
        console.error('Không thể tải danh sách vai trò:', err);
        this.notificationService.error('Không thể tải danh sách vai trò!');
        this.dataLoaded = true;
      }
    });
  }

  loadUser(id: number) {
    console.log('Loading user with id:', id, 'Type:', typeof id);
    this.userService.getUserById(String(id)).subscribe({
      next: (user) => {
        console.log('User loaded successfully:', user);
        if (!user) {
          this.notificationService.error('Không thể tải thông tin người dùng - Dữ liệu trống!');
          this.loading = false;
          this.dataLoaded = true;
          return;
        }
        this.form = {
          username: user.username || '',
          password: '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          roleIds: user.roles ? user.roles.map((r: any) => r.id) : []
        };
        this.loading = false;
        this.dataLoaded = true;
        console.log('Form updated successfully:', this.form);
      },
      error: (err) => {
        console.error('Error loading user:', err);
        const errorMsg = err.error?.message || err.message || 'Không thể tải thông tin người dùng!';
        this.notificationService.error(errorMsg);
        this.loading = false;
        this.dataLoaded = true;
      }
    });
  }

  onSubmit() {
    if (!this.userId && !this.user) {
      this.notificationService.error('Không có thông tin người dùng để cập nhật!');
      return;
    }
    
    this.loading = true;
    // Use numeric ID as the identifier (not username)
    const userId = this.user?.id || String(this.userId);
    
    // Create update request without password
    const updateRequest = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      roleIds: this.form.roleIds
    };
    
    console.log('Updating user ID:', userId);
    console.log('User object:', this.user);
    console.log('Update request:', updateRequest);
    
    this.userService.updateUser(userId, updateRequest).subscribe({
      next: (response) => {
        console.log('Update response:', response);
        this.notificationService.success('Cập nhật người dùng thành công!');
        this.loading = false;
        this.saved.emit();
        this.closeDialog();
      },
      error: (err) => {
        console.error('Error updating user:', err);
        console.error('Error status:', err.status);
        console.error('Error response:', err.error);
        const errorMsg = err.error?.message || err.error?.result?.message || err.message || 'Lỗi khi cập nhật dữ liệu!';
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
