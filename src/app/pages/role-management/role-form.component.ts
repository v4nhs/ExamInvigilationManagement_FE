import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { RoleService, Role } from '../../services/role.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-form.component.html',
  styleUrls: ['./role-form.component.css']
})
export class RoleFormComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Input() editRoleId: number | null = null;

  role: Role = { id: 0, name: '', description: '' };
  loading = false;

  constructor(
    private roleService: RoleService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    if (this.editRoleId) {
      this.loadRole(this.editRoleId);
    }
  }

  loadRole(id: number) {
    this.loading = true;
    this.roleService.getRoleById(id).subscribe({
      next: (data) => {
        this.role = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading role:', err);
        this.notificationService.error('Không thể tải dữ liệu vai trò!');
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (!this.role.name.trim()) {
      this.notificationService.warning('Vui lòng nhập tên vai trò');
      return;
    }

    this.loading = true;
    const request = this.editRoleId
      ? this.roleService.updateRole(this.editRoleId, this.role)
      : this.roleService.createRole(this.role);

    request.subscribe({
      next: () => {
        this.notificationService.success(this.editRoleId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        this.loading = false;
        this.saved.emit();
        this.closeDialog();
      },
      error: (err) => {
        console.error('Error saving role:', err);
        const errorMsg = err.error?.message || 'Lỗi khi lưu dữ liệu!';
        this.notificationService.error(errorMsg);
        this.loading = false;
      }
    });
  }

  closeDialog(): void {
    this.close.emit();
  }
}