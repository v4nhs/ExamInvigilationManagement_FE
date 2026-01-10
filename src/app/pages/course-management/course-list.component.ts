import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CourseService } from '../../services/course.service';
import { DepartmentService } from '../../services/department.service';
import { CourseAddComponent } from './course-add.component';
import { Course } from '../../models/course.models';
import { Department } from '../../models/department.models';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CourseAddComponent],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.css']
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  departments: Department[] = [];
  loading = false;
  deleting: number | null = null;
  showImportDialog = false;
  selectedDepartmentId: number = 0;
  importFile: File | null = null;
  importing = false;
  showAddForm = false;
  editingCourseId: number | null = null;

  constructor(
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.fetchCourses();
    this.loadDepartments();
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

  openAddForm() {
    this.editingCourseId = null;
    this.showAddForm = true;
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingCourseId = null;
  }

  onCourseSaved() {
    this.closeAddForm();
    this.fetchCourses();
  }

  fetchCourses() {
    this.loading = true;
    this.courseService.getAll().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deleteCourse(id: number) {
    if (!confirm('Bạn có chắc chắn muốn xóa học phần này?')) return;

    this.deleting = id;
    this.courseService.delete(id).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => c.id !== id);
        this.deleting = null;
        this.message.success('Xóa học phần thành công!');
      },
      error: (err) => {
        this.message.error('Xóa học phần thất bại!');
        this.deleting = null;
        console.error(err);
      }
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    this.importFile = files[0];
    this.selectedDepartmentId = 0;
    this.showImportDialog = true;
  }

  confirmImport(): void {
    if (!this.importFile) {
      this.message.warning('Vui lòng chọn file');
      return;
    }

    if (this.selectedDepartmentId === 0) {
      this.message.warning('Vui lòng chọn khoa');
      return;
    }

    this.importing = true;
    this.courseService.import(this.selectedDepartmentId, this.importFile).subscribe({
      next: () => {
        this.message.success('Import thành công!');
        this.fetchCourses();
        this.closeImportDialog();
      },
      error: (err) => {
        console.error('Error importing courses:', err);
        this.message.error('Lỗi khi import file');
        this.importing = false;
      }
    });
  }

  closeImportDialog(): void {
    this.showImportDialog = false;
    this.importFile = null;
    this.selectedDepartmentId = 0;
    this.importing = false;
  }
}
