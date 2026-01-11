import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamScheduleService, Page } from '../../services/exam-schedule.service';
import { CourseService } from '../../services/course.service';
import { DepartmentService } from '../../services/department.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ExamSchedule } from '../../models/exam-schedule.models';
import { Course } from '../../models/course.models';
import { Department } from '../../models/department.models';
import { ExamScheduleFormComponent } from './exam-schedule-form.component';

@Component({
  selector: 'app-exam-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ExamScheduleFormComponent],
  templateUrl: './exam-schedule-list.component.html',
  styleUrls: ['./exam-schedule-list.component.css']
})
export class ExamScheduleListComponent implements OnInit {
  schedules: ExamSchedule[] = [];
  filteredSchedules: ExamSchedule[] = [];
  courses: Course[] = [];
  departments: Department[] = [];
  loading = false;
  showImportDialog = false;
  showAddForm = false;
  showLecturerModal = false;
  selectedScheduleForLecturers: ExamSchedule | null = null;
  lecturerList: any[] = [];
  importFile: File | null = null;
  importing = false;
  selectedDepartmentId: number | null = null;
  searchQuery: string = '';

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'examDate';
  sortDirection: string = 'DESC';
  Math = Math;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  constructor(
    private examScheduleService: ExamScheduleService,
    private courseService: CourseService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchSchedulesPaginated();
    this.loadCourses();
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

  loadCourses(): void {
    this.courseService.getAll().subscribe({
      next: (data) => {
        this.courses = data;
      },
      error: (err) => {
        console.error('Error loading courses:', err);
      }
    });
  }

  fetchSchedulesPaginated() {
    this.loading = true;
    if (this.searchQuery.trim()) {
      this.examScheduleService.searchSchedules(this.searchQuery, this.currentPage, this.pageSize).subscribe({
        next: (page: Page<ExamSchedule>) => this.handlePageResponse(page),
        error: () => this.handleError()
      });
    } else {
      this.examScheduleService.getSchedulesPaginated(this.currentPage, this.pageSize, this.sortBy, this.sortDirection).subscribe({
        next: (page: Page<ExamSchedule>) => this.handlePageResponse(page),
        error: () => this.handleError()
      });
    }
  }

  handlePageResponse(page: Page<ExamSchedule>) {
    this.schedules = page.content || [];
    this.filteredSchedules = this.schedules;
    this.totalElements = page.totalElements;
    this.totalPages = page.totalPages;
    this.loading = false;
  }

  handleError() {
    this.loading = false;
  }

  onSearchChange() {
    this.currentPage = 0;
    this.fetchSchedulesPaginated();
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.fetchSchedulesPaginated();
  }

  onSortChange() {
    this.currentPage = 0;
    this.fetchSchedulesPaginated();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchSchedulesPaginated();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.fetchSchedulesPaginated();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchSchedulesPaginated();
    }
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
    this.fetchSchedulesPaginated();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    this.importFile = files[0];
    this.selectedDepartmentId = null;
    this.showImportDialog = true;
  }

  confirmImport(): void {
    if (!this.importFile) {
      this.notificationService.warning('Vui lòng chọn file');
      return;
    }

    if (!this.selectedDepartmentId) {
      this.notificationService.warning('Vui lòng chọn khoa');
      return;
    }

    this.importing = true;
    this.examScheduleService.import(this.importFile).subscribe({
      next: () => {
        this.notificationService.success('Import lịch thi thành công!');
        this.fetchSchedules();
        this.closeImportDialog();
      },
      error: (err) => {
        console.error('Error importing schedules:', err);
        this.notificationService.error('Lỗi khi import file');
        this.importing = false;
      }
    });
  }

  closeImportDialog(): void {
    this.showImportDialog = false;
    this.importFile = null;
    this.importing = false;
    this.selectedDepartmentId = null;
  }

  openAddForm(): void {
    this.showAddForm = true;
  }

  closeAddForm(): void {
    this.showAddForm = false;
  }

  onScheduleSaved(): void {
    this.fetchSchedules();
  }

  fetchSchedules() {
    this.currentPage = 0;
    this.fetchSchedulesPaginated();
  }

  viewAssignedLecturers(scheduleId: number) {
    const schedule = this.schedules.find(s => s.id === scheduleId);
    if (schedule) {
      this.selectedScheduleForLecturers = schedule;
      this.loadLecturersForSchedule(scheduleId);
      this.showLecturerModal = true;
    }
  }

  loadLecturersForSchedule(scheduleId: number) {
    this.examScheduleService.getLecturersForSchedule(scheduleId).subscribe({
      next: (lecturers: any[]) => {
        // Validate và normalize lecturer data
        this.lecturerList = (lecturers || []).map((lecturer: any) => ({
          ...lecturer,
          // Ensure lecturer code is present and valid
          code: (lecturer.code || lecturer.lecturerCode || '').trim() || 'N/A',
          lecturerCode: (lecturer.code || lecturer.lecturerCode || '').trim() || 'N/A',
          // Ensure lecturer name is present
          lecturerName: (lecturer.lecturerName || lecturer.fullName || '').trim() || 'N/A',
          fullName: (lecturer.lecturerName || lecturer.fullName || '').trim() || 'N/A',
          // Ensure email is present
          email: (lecturer.email || '').trim() || 'N/A'
        })).filter(lecturer => {
          // Filter out invalid entries
          if (!lecturer.code || lecturer.code === 'N/A') {
            console.warn('Lecturer missing code:', lecturer);
          }
          return true; // Show all, but log warnings
        });
      },
      error: (err) => {
        console.error('Error loading lecturers:', err);
        this.notificationService.error('Lỗi khi tải danh sách giảng viên');
        this.lecturerList = [];
      }
    });
  }

  closeLecturerModal() {
    this.showLecturerModal = false;
    this.selectedScheduleForLecturers = null;
    this.lecturerList = [];
  }

  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    const isAdminUser = this.authService.isAdmin();
    console.log('🔍 isAdmin() check - User:', user, 'isAdmin:', isAdminUser);
    return isAdminUser;
  }
}
