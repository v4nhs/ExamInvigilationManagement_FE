import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { RoleService, Role } from '../../services/role.service';
import { RoleFormComponent } from './role-form.component';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RoleFormComponent],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];
  loading = false;
  deleting: number | null = null;
  showAddForm = false;
  editingRoleId: number | null = null;

  constructor(
    private roleService: RoleService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.roles = data;
        } else if (data && Array.isArray((data as any).result)) {
          this.roles = (data as any).result;
        } else if (data && Array.isArray((data as any).content)) {
          this.roles = (data as any).content;
        } else if (data && Array.isArray((data as any).data)) {
          this.roles = (data as any).data;
        } else {
          this.roles = [];
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Lỗi tải danh sách vai trò:', err);
      }
    });
  }

  openAddForm() {
    this.editingRoleId = null;
    this.showAddForm = true;
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingRoleId = null;
  }

  onRoleSaved() {
    this.closeAddForm();
    this.loadRoles();
  }

  deleteRole(role: Role) {
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}"?`);
    if (!confirmed) return;

    this.deleting = role.id;
    this.roleService.deleteRole(role.id).subscribe({
      next: () => {
        this.roles = this.roles.filter(r => r.id !== role.id);
        this.deleting = null;
        this.message.success('Xóa vai trò thành công!');
      },
      error: (err) => {
        this.message.error('Xóa vai trò thất bại!');
        this.deleting = null;
        console.error(err);
      }
    });
  }
}