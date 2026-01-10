import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CourseService } from '../../services/course.service';
import { DepartmentService } from '../../services/department.service';
import { CourseRequest } from '../../models/course.models';
import { Department } from '../../models/department.models';

@Component({
  selector: 'app-course-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-add.component.html',
  styleUrls: ['./course-add.component.css']
})
export class CourseAddComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Input() editCourseId: number | null = null;

  course: CourseRequest = {
    name: '',
    code: '',
    credits: 0,
    description: '',
    departmentId: 0
  };

  departments: Department[] = [];
  loading = false;

  constructor(
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    if (this.editCourseId) {
      this.loadCourse(this.editCourseId);
    }
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });
  }

  loadCourse(id: number): void {
    this.loading = true;
    this.courseService.getById(id).subscribe({
      next: (data) => {
        this.course = {
          name: data.name,
          code: data.code,
          credits: data.credits,
          description: data.description || '',
          departmentId: data.departmentId
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading course:', err);
        this.loading = false;
        this.message.error('Không thể tải dữ liệu học phần!');
      }
    });
  }

  save(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    const request = this.editCourseId
      ? this.courseService.update(this.editCourseId, this.course)
      : this.courseService.create(this.course);

    request.subscribe({
      next: () => {
        this.message.success(this.editCourseId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        this.loading = false;
        this.saved.emit();
        this.closeDialog();
      },
      error: (err) => {
        console.error('Error saving course:', err);
        this.message.error('Lỗi khi lưu dữ liệu!');
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.course.name.trim()) {
      this.message.warning('Vui lòng nhập tên học phần');
      return false;
    }
    if (!this.course.code.trim()) {
      this.message.warning('Vui lòng nhập mã học phần');
      return false;
    }
    if (this.course.credits <= 0) {
      this.message.warning('Số tín chỉ phải lớn hơn 0');
      return false;
    }
    if (this.course.departmentId === 0) {
      this.message.warning('Vui lòng chọn khoa');
      return false;
    }
    return true;
  }

  closeDialog(): void {
    this.close.emit();
  }
}
