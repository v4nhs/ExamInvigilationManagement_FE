import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ExamScheduleService } from '../../services/exam-schedule.service';
import { ExamSchedule } from '../../models/exam-schedule.models';

@Component({
  selector: 'app-exam-assignment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './exam-assignment-list.component.html',
  styleUrls: ['./exam-assignment-list.component.css']
})
export class ExamAssignmentListComponent implements OnInit {
  schedules: ExamSchedule[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private examScheduleService: ExamScheduleService,
    private router: Router,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.fetchSchedules();
  }

  fetchSchedules() {
    this.loading = true;
    this.error = null;
    console.log('Fetching exam schedules...');
    this.examScheduleService.getAll().subscribe({
      next: (data) => {
        console.log('Schedules loaded:', data);
        this.schedules = Array.isArray(data) ? data : [];
        this.loading = false;
        if (this.schedules.length === 0) {
          this.message.info('Không có lịch thi nào');
        }
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.loading = false;
        
        // If 403 or 404, use sample data for development
        if (err.status === 403 || err.status === 404) {
          console.warn('Backend endpoint not available, using sample data');
          this.schedules = [
            {
              id: 1,
              courseId: 1,
              courseName: 'Lập trình Web',
              courseCode: 'CSE202',
              examDate: '2025-10-22',
              examDay: 'Thứ 4',
              examTime: '09:00',
              room: 'Phòng A101',
              examType: 'WRITTEN',
              studentCount: 30,
              invigilatorCount: 2,
              status: 'PLANNED'
            },
            {
              id: 2,
              courseId: 2,
              courseName: 'Cơ sở dữ liệu',
              courseCode: 'CSE203',
              examDate: '2025-10-23',
              examDay: 'Thứ 5',
              examTime: '13:30',
              room: 'Phòng B202',
              examType: 'OTHER',
              studentCount: 25,
              invigilatorCount: 2,
              status: 'PLANNED'
            }
          ];
          this.message.info('Sử dụng dữ liệu mẫu vì backend chưa sẵn sàng');
          return;
        }
        
        this.error = 'Không thể tải danh sách lịch thi';
        this.message.error(this.error);
      }
    });
  }

  goToAssignment(scheduleId: number): void {
    this.router.navigate(['/exam-assignment', scheduleId]);
  }
}
