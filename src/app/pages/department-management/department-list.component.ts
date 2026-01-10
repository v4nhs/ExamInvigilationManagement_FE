import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DepartmentService } from '../../services/department.service';
import { DepartmentAddComponent } from './department-add.component';
import { Department } from '../../models/department.models';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterModule, DepartmentAddComponent],
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.css']
})
export class DepartmentListComponent implements OnInit {
  departments: Department[] = [];
  loading = false;
  error = '';
  deleting: number | null = null;
  showAddForm = false;
  editingDepartmentId: number | null = null;

  constructor(
    private departmentService: DepartmentService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.fetchDepartments();
  }

  fetchDepartments() {
    this.loading = true;
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Không thể tải danh sách khoa';
        this.loading = false;
      }
    });
  }

  openAddForm() {
    this.editingDepartmentId = null;
    this.showAddForm = true;
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingDepartmentId = null;
  }

  onDepartmentSaved() {
    this.closeAddForm();
    this.fetchDepartments();
  }

  deleteDepartment(id: number) {
    if (!id) {
      this.message.error('ID khoa không hợp lệ');
      return;
    }
    const confirmed = confirm('Bạn có chắc chắn muốn xóa khoa này?');
    if (!confirmed) return;

    this.deleting = id;
    this.departmentService.delete(id).subscribe({
      next: () => {
        this.departments = this.departments.filter(d => d.id !== id);
        this.deleting = null;
        this.message.success('Xóa khoa thành công!');
      },
      error: (err) => {
        this.message.error('Xóa khoa thất bại!');
        this.deleting = null;
        console.error(err);
      }
    });
  }
}
