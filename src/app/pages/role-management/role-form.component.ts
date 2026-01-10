import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService, Role } from '../../services/role.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>{{ isEditMode ? 'Cập nhật vai trò' : 'Thêm vai trò mới' }}</h2>
    <form (ngSubmit)="onSubmit()" class="role-form">
      <div class="form-group">
        <label>Tên vai trò (VD: ADMIN):</label>
        <input [(ngModel)]="role.name" name="name" required placeholder="Nhập tên vai trò" />
      </div>

      <div class="form-group">
        <label>Mô tả:</label>
        <textarea [(ngModel)]="role.description" name="description" rows="3"></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-save">Lưu lại</button>
        <button type="button" class="btn-cancel" (click)="goBack()">Hủy bỏ</button>
      </div>
    </form>
  `,
  styles: [`
    .role-form { max-width: 500px; background: #fff; padding: 24px; border-radius: 8px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
    .form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px; box-sizing: border-box;}
    .form-actions { display: flex; gap: 10px; margin-top: 20px; }
    .btn-save { background: #1890ff; color: white; border: none; padding: 8px 24px; border-radius: 4px; cursor: pointer; }
    .btn-cancel { background: #f5f5f5; color: #333; border: 1px solid #d9d9d9; padding: 8px 24px; border-radius: 4px; cursor: pointer; }
  `]
})
export class RoleFormComponent implements OnInit {
  role: Role = { id: 0, name: '', description: '' };
  private editId: number | null = null;
  isEditMode = false;

  constructor(
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      if (!isNaN(id)) {
        this.isEditMode = true;
        this.editId = id;
        this.roleService.getRoleById(id).subscribe(data => this.role = data);
      }
    }
  }

  onSubmit() {
    if (this.isEditMode && this.editId != null) {
      this.roleService.updateRole(this.editId, this.role).subscribe(() => {
        alert('Cập nhật thành công!');
        this.goBack();
      });
    } else {
      this.roleService.createRole(this.role).subscribe(() => {
        alert('Thêm mới thành công!');
        this.goBack();
      });
    }
  }

  goBack() {
    this.router.navigate(['/user-management/roles']);
  }
}