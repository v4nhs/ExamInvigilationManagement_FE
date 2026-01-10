import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RoleService, Role } from '../../services/role.service';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <h2>Quản lý vai trò</h2>
      <button class="btn-add" routerLink="/user-management/roles/add">+ Thêm vai trò</button>
    </div>
    
    <table class="custom-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên vai trò</th>
          <th>Mô tả</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let role of roles">
          <td>{{ role.id }}</td>
          <td><span class="role-badge">{{ role.name }}</span></td>
          <td>{{ role.description || 'Không có mô tả' }}</td>
          <td>
            <button class="btn-edit" (click)="editRole(role.id)">Sửa</button>
            <button class="btn-delete" (click)="deleteRole(role)">Xoá</button>
          </td>
        </tr>
      </tbody>
    </table>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .custom-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .custom-table th, .custom-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #eee; }
    .custom-table th { background: #fafafa; font-weight: 600; color: #555; }
    .btn-add { background: #1890ff; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .btn-edit { background: #faad14; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-right: 8px; }
    .btn-delete { background: #ff4d4f; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
    .role-badge { background: #e6f7ff; color: #1890ff; padding: 2px 8px; border-radius: 4px; font-weight: 500; border: 1px solid #91d5ff; }
  `]
})
export class RoleListComponent implements OnInit {
  roles: Role[] = [];

  constructor(private roleService: RoleService, private router: Router) {}

  ngOnInit() {
    this.roleService.getRoles().subscribe(data => {
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
        console.error('Không lấy được danh sách vai trò từ API!', data);
      }
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe(data => {
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
        console.error('Không lấy được danh sách vai trò từ API!', data);
      }
    });
  }

  editRole(id: number) {
    this.router.navigate(['/user-management/roles/edit', id]);
  }

  deleteRole(role: Role) {
    if (confirm(`Bạn có chắc muốn xoá vai trò ${role.name}?`)) {
      this.roleService.deleteRole(role.id).subscribe(() => this.loadRoles());
    }
  }
}