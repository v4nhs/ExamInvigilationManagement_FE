import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { ExamScheduleService } from '../../services/exam-schedule.service';
import { LecturerService } from '../../services/lecturer.service';
import { ExamSchedule, AssignLecturerRequest, AvailableLecturer } from '../../models/exam-schedule.models';
import { Lecturer } from '../../models/lecturer.models';

@Component({
  selector: 'app-exam-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './exam-assignment.component.html',
  styleUrls: ['./exam-assignment.component.css']
})
export class ExamAssignmentComponent implements OnInit {
  schedule: ExamSchedule | null = null;
  availableLecturers: AvailableLecturer[] = [];
  allLecturers: Lecturer[] = [];
  selectedLecturers: number[] = [];
  assignedLecturerIds: number[] = [];
  room: string = '';
  studentCount: number = 0;
  assignmentType: 'WRITTEN' | 'OTHER' = 'WRITTEN';

  loading = false;
  assigning = false;
  scheduleId: number | null = null;
  error: string | null = null;

  constructor(
    private examScheduleService: ExamScheduleService,
    private lecturerService: LecturerService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAllLecturers();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.scheduleId = parseInt(params['id']);
        this.loadSchedule(this.scheduleId);
        this.loadAvailableLecturers(this.scheduleId);
        this.loadAssignedLecturers(this.scheduleId);
      }
    });
  }

  loadSchedule(id: number): void {
    this.loading = true;
    this.error = null;
    this.examScheduleService.getById(id).subscribe({
      next: (data) => {
        this.schedule = data;
        this.studentCount = data.studentCount || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading schedule:', err);
        this.loading = false;
        
        // If 403 or 404, use sample data for development
        if (err.status === 403 || err.status === 404) {
          console.warn('Backend endpoint not available, using sample data');
          this.schedule = {
            id: id,
            courseId: 1,
            courseName: 'Lập trình Web',
            courseCode: 'CSE202',
            examDate: new Date().toISOString().split('T')[0],
            examDay: 'Thứ 4',
            examTime: '09:00',
            room: 'Phòng A101',
            examType: 'WRITTEN',
            studentCount: 30,
            invigilatorCount: 2,
            status: 'PLANNED'
          };
          this.studentCount = this.schedule.studentCount || 0;
          this.loading = false;
          this.notificationService.info('Sử dụng dữ liệu mẫu vì backend chưa sẵn sàng');
          return;
        }
        
        let errorMsg = 'Không thể tải lịch thi!';
        if (err.status === 0) {
          errorMsg = 'Không thể kết nối tới server. Vui lòng kiểm tra kết nối mạng.';
        }
        this.error = errorMsg;
        this.notificationService.error(errorMsg);
      }
    });
  }

  loadAvailableLecturers(id: number): void {
    this.examScheduleService.getAvailableLecturers(id).subscribe({
      next: (data) => {
        console.log('Available lecturers:', data);
        this.availableLecturers = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error loading available lecturers:', err);
        // Fallback: load all lecturers if available-lecturers endpoint fails
        this.availableLecturers = this.allLecturers.map(l => ({
          id: l.id,
          fullName: l.fullName,
          department: l.department
        }));
      }
    });
  }

  loadAssignedLecturers(id: number): void {
    this.examScheduleService.getAssignedLecturers(id).subscribe({
      next: (data) => {
        console.log('Assigned lecturers:', data);
        this.assignedLecturerIds = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error loading assigned lecturers:', err);
        this.assignedLecturerIds = [];
      }
    });
  }

  loadAllLecturers(): void {
    this.lecturerService.getAll().subscribe({
      next: (data) => {
        this.allLecturers = data;
      },
      error: (err) => {
        console.error('Error loading lecturers:', err);
      }
    });
  }

  toggleLecturer(lecturerId: number): void {
    const index = this.selectedLecturers.indexOf(lecturerId);
    if (index > -1) {
      this.selectedLecturers.splice(index, 1);
    } else {
      this.selectedLecturers.push(lecturerId);
    }
  }

  isSelected(lecturerId: number): boolean {
    return this.selectedLecturers.includes(lecturerId);
  }

  isAlreadyAssigned(lecturerId: number): boolean {
    return this.assignedLecturerIds.includes(lecturerId);
  }

  assign(): void {
    if (!this.validateForm()) return;

    if (!this.scheduleId) {
      this.notificationService.error('Không tìm thấy lịch thi!');
      return;
    }

    this.assigning = true;
    const request: AssignLecturerRequest = {
      lecturerIds: this.selectedLecturers,
      room: this.room,
      studentCount: this.studentCount
    };

    const assignCall = this.assignmentType === 'WRITTEN'
      ? this.examScheduleService.assignWritten(this.scheduleId, request)
      : this.examScheduleService.assignOther(this.scheduleId, request);

    assignCall.subscribe({
      next: () => {
        this.notificationService.success('Phân công giảng viên thành công!');
        this.router.navigate(['/exam-assignment']);
      },
      error: (err) => {
        console.error('Error assigning lecturers:', err);
        this.notificationService.error('Lỗi khi phân công giảng viên!');
        this.assigning = false;
      }
    });
  }

  validateForm(): boolean {
    if (this.selectedLecturers.length === 0) {
      this.notificationService.warning('Vui lòng chọn ít nhất 1 giảng viên');
      return false;
    }
    if (!this.room.trim()) {
      this.notificationService.warning('Vui lòng nhập phòng thi');
      return false;
    }
    if (this.studentCount <= 0) {
      this.notificationService.warning('Số sinh viên phải lớn hơn 0');
      return false;
    }
    return true;
  }

  cancel(): void {
    this.router.navigate(['/exam-assignment']);
  }

  getLecturerName(lecturerId: number): string {
    const lecturer = this.allLecturers.find(l => l.id === lecturerId);
    return lecturer ? lecturer.fullName : 'N/A';
  }
}
