import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LecturerService } from '../../services/lecturer.service';
import { DepartmentService } from '../../services/department.service';
import { Lecturer, LecturerRequest } from '../../models/lecturer.models';
import { Department } from '../../models/department.models';

@Component({
  selector: 'app-lecturer-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lecturer-add.component.html',
  styleUrls: ['./lecturer-add.component.css']
})
export class LecturerAddComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Input() editLecturerId: number | null = null;

  lecturer: LecturerRequest = {
    fullName: '',
    email: '',
    phone: '',
    departmentId: undefined,
    academicTitle: '',
    specialization: ''
  };

  departments: Department[] = [];
  loading = false;

  constructor(
    private lecturerService: LecturerService,
    private departmentService: DepartmentService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    
    if (this.editLecturerId) {
      this.loadLecturer(this.editLecturerId);
    }
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
        console.log('Departments loaded:', this.departments);
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.message.error('Không thể tải danh sách phòng ban!');
      }
    });
  }

  loadLecturer(id: number): void {
    this.loading = true;
    this.lecturerService.getById(id).subscribe({
      next: (data) => {
        this.lecturer = {
          fullName: data.fullName,
          email: data.email,
          phone: data.phone || '',
          departmentId: data.department?.id || data.departmentId,
          academicTitle: data.academicTitle || '',
          specialization: data.specialization || ''
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading lecturer:', err);
        this.loading = false;
        this.message.error('Không thể tải dữ liệu giảng viên!');
      }
    });
  }

  save(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    console.log('Saving lecturer with data:', this.lecturer);
    
    const request = this.editLecturerId
      ? this.lecturerService.update(this.editLecturerId, this.lecturer)
      : this.lecturerService.create(this.lecturer);

    request.subscribe({
      next: () => {
        this.message.success(this.editLecturerId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        this.loading = false;
        this.saved.emit();
        this.closeDialog();
      },
      error: (err) => {
        console.error('Error saving lecturer:', err);
        console.error('Error response:', err.error);
        const errorMsg = err.error?.message || 'Lỗi khi lưu dữ liệu!';
        this.message.error(errorMsg);
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.lecturer.fullName.trim()) {
      this.message.warning('Vui lòng nhập họ tên');
      return false;
    }
    if (!this.lecturer.email.trim()) {
      this.message.warning('Vui lòng nhập email');
      return false;
    }
    if (!this.isValidEmail(this.lecturer.email)) {
      this.message.warning('Email không hợp lệ');
      return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  closeDialog(): void {
    this.close.emit();
  }
}
