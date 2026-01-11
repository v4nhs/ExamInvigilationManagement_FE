import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamScheduleService } from '../../services/exam-schedule.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { ExamSchedule } from '../../models/exam-schedule.models';

@Component({
  selector: 'app-my-exam-assignments',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './my-exam-assignments.component.html',
  styleUrls: ['./my-exam-assignments.component.css']
})
export class MyExamAssignmentsComponent implements OnInit {
  myExamSchedules: ExamSchedule[] = [];
  filteredSchedules: ExamSchedule[] = [];
  paginatedSchedules: ExamSchedule[] = [];
  
  loading = false;
  error: string | null = null;
  searchQuery = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  
  // Sorting
  sortBy: 'date' | 'courseName' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Current user
  currentUserId: string | null = null;
  currentUserName = '';
  pageArray: number[] = [];
  
  Math = Math;

  constructor(
    private examScheduleService: ExamScheduleService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Lấy user info sau khi component được initialize
    const user = this.authService.getCurrentUser();
    console.log('My exam assignments - Current user:', user);
    
    if (user) {
      this.currentUserId = user.id;
      this.currentUserName = user.username || 'Giảng Viên';
    }
    
    this.loadMyExamAssignments();
  }

  loadMyExamAssignments(): void {
    const user = this.authService.getCurrentUser();
    console.log('Current user:', user);
    
    if (!this.currentUserId) {
      this.error = 'Không thể xác định thông tin giảng viên';
      return;
    }

    this.loading = true;
    this.error = null;

    console.log('Lecturer ID/Username:', this.currentUserId);
    console.log('Calling API endpoint: /api/exam-schedules/lecturer/' + this.currentUserId);
    
    this.examScheduleService.getMyExamAssignments(this.currentUserId).subscribe({
      next: (data) => {
        console.log('My exam assignments:', data);
        this.myExamSchedules = Array.isArray(data) ? data : [];
        this.applyFiltersAndSort();
        this.loading = false;
        
        if (this.myExamSchedules.length === 0) {
          this.notificationService.info('Bạn chưa được phân công lịch thi nào');
        }
      },
      error: (err) => {
        console.error('Error loading my exam assignments:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error response:', err.error);
        
        this.loading = false;
        
        const errorMsg = err.error?.message || '';
        
        if (err.status === 403) {
          this.error = 'Bạn không có quyền xem thông tin này';
        } else if (err.status === 404) {
          this.error = 'Không tìm thấy lịch thi của bạn. Kiểm tra xem bạn đã được thêm vào danh sách giảng viên chưa.';
        } else if (err.status === 400) {
          if (errorMsg.includes('Failed to convert') || errorMsg.includes('For input string')) {
            this.error = `⚠️ BACKEND CHƯA CẬP NHẬT: Endpoint /api/exam-schedules/lecturer/{lecturerId} vẫn chỉ chấp nhận numeric ID. Cần cập nhật backend để nhận String. Chi tiết: ${errorMsg}`;
          } else {
            this.error = `Lỗi yêu cầu (400): ${errorMsg}`;
          }
        } else {
          this.error = 'Lỗi tải dữ liệu. Vui lòng thử lại.';
        }
      }
    });
  }

  applyFiltersAndSort(): void {
    this.generatePageArray();
    let result = [...this.myExamSchedules];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(schedule =>
        (schedule.courseName || '').toLowerCase().includes(query) ||
        (schedule.courseCode || '').toLowerCase().includes(query) ||
        (schedule.room || '').toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: any, bVal: any;
      
      if (this.sortBy === 'date') {
        aVal = new Date(a.examDate || '').getTime();
        bVal = new Date(b.examDate || '').getTime();
      } else {
        aVal = (a.courseName || '').toLowerCase();
        bVal = (b.courseName || '').toLowerCase();
      }

      if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    this.filteredSchedules = result;
    this.totalItems = result.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.currentPage = 1;
    this.paginate();
  }

  paginate(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedSchedules = this.filteredSchedules.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.paginate();
    }
  }

  generatePageArray(): void {
    this.pageArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'badge-success';
      case 'IN_PROGRESS':
        return 'badge-warning';
      case 'CANCELLED':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  }

  getStatusText(status?: string): string {
    const statusMap: { [key: string]: string } = {
      'COMPLETED': 'Hoàn tất',
      'IN_PROGRESS': 'Đang diễn ra',
      'PLANNED': 'Lên lịch',
      'CANCELLED': 'Hủy'
    };
    return statusMap[status || ''] || 'Không xác định';
  }
}
