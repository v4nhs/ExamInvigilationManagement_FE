import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService, Page } from '../../services/course.service';
import { DepartmentService } from '../../services/department.service';
import { NotificationService } from '../../services/notification.service';
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
  filteredCourses: Course[] = [];
  departments: Department[] = [];
  loading = false;
  deleting: number | null = null;
  showImportDialog = false;
  selectedDepartmentId: number = 0;
  importFile: File | null = null;
  importing = false;
  showAddForm = false;
  editingCourseId: number | null = null;
  searchQuery: string = '';
  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'id';
  sortDirection: string = 'ASC';
  Math = Math;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  constructor(
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.fetchCoursesPaginated();
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

  fetchCoursesPaginated() {
    this.loading = true;
    if (this.searchQuery.trim()) {
      this.courseService.searchCourses(this.searchQuery, this.currentPage, this.pageSize).subscribe({
        next: (page: Page<Course>) => this.handlePageResponse(page),
        error: () => this.handleError()
      });
    } else {
      this.courseService.getCoursesPaginated(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
        next: (page: Page<Course>) => this.handlePageResponse(page),
        error: () => this.handleError()
      });
    }
  }

  handlePageResponse(page: Page<Course>) {
    this.courses = page.content || [];
    this.filteredCourses = this.courses;
    this.totalElements = page.totalElements;
    this.totalPages = page.totalPages;
    this.loading = false;
  }

  handleError() {
    this.loading = false;
  }

  openAddForm(id?: number) {
    this.editingCourseId = id || null;
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

  onSearchChange() {
    this.currentPage = 0;
    this.fetchCoursesPaginated();
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.fetchCoursesPaginated();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchCoursesPaginated();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.fetchCoursesPaginated();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchCoursesPaginated();
    }
  }

  fetchCourses() {
    this.currentPage = 0;
    this.fetchCoursesPaginated();
  }

  deleteCourse(id: number) {
    if (!confirm('Bạn có chắc chắn muốn xóa học phần này?')) return;

    this.deleting = id;
    this.courseService.delete(id).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => c.id !== id);
        this.deleting = null;
        this.notificationService.success('Xóa học phần thành công!');
      },
      error: (err) => {
        this.notificationService.error('Xóa học phần thất bại!');
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
      this.notificationService.warning('Vui lòng chọn file');
      return;
    }

    if (this.selectedDepartmentId === 0) {
      this.notificationService.warning('Vui lòng chọn khoa');
      return;
    }

    this.importing = true;
    this.courseService.import(this.selectedDepartmentId, this.importFile).subscribe({
      next: () => {
        this.notificationService.success('Import thành công!');
        this.fetchCourses();
        this.closeImportDialog();
      },
      error: (err) => {
        console.error('Error importing courses:', err);
        this.notificationService.error('Lỗi khi import file');
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

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible);
    
    if (endPage - startPage < maxVisible) {
      startPage = Math.max(0, endPage - maxVisible);
    }
    
    for (let i = startPage; i < endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.fetchCoursesPaginated();
  }
}
