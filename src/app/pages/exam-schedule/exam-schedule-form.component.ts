import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { ExamScheduleService } from '../../services/exam-schedule.service';
import { CourseService } from '../../services/course.service';
import { CreateExamScheduleRequest } from '../../models/exam-schedule.models';
import { Course } from '../../models/course.models';

@Component({
  selector: 'app-exam-schedule-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exam-schedule-form.component.html',
  styleUrls: ['./exam-schedule-form.component.css']
})
export class ExamScheduleFormComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  courses: Course[] = [];
  loading = false;
  submitting = false;

  form = {
    courseId: null as number | null,
    examDate: '',
    examTime: '09:00',
    endTime: '11:00',
    examDay: '',
    examType: 'WRITTEN' as 'WRITTEN' | 'OTHER',
    room: '',
    invigilatorCount: 0
  };

  daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

  constructor(
    private examScheduleService: ExamScheduleService,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.courseService.getAll().subscribe({
      next: (data) => {
        this.courses = Array.isArray(data) ? data : [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading courses:', err);
        this.notificationService.error('Lỗi tải danh sách khóa học');
        this.loading = false;
      }
    });
  }

  onDateChange(): void {
    if (this.form.examDate) {
      const date = new Date(this.form.examDate);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      this.form.examDay = this.daysOfWeek[dayIndex];
    }
  }

  onTimeChange(): void {
    if (this.form.examTime && !this.form.endTime) {
      const [hours, minutes] = this.form.examTime.split(':').map(Number);
      const endHour = hours + 2;
      this.form.endTime = `${String(endHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  }

  validateForm(): boolean {
    if (!this.form.courseId) {
      this.notificationService.warning('Vui lòng chọn khóa học');
      return false;
    }
    if (!this.form.examDate) {
      this.notificationService.warning('Vui lòng chọn ngày thi');
      return false;
    }
    if (!this.form.examTime) {
      this.notificationService.warning('Vui lòng chọn giờ thi');
      return false;
    }
    if (!this.form.endTime) {
      this.notificationService.warning('Vui lòng chọn giờ kết thúc');
      return false;
    }
    if (!this.form.room.trim()) {
      this.notificationService.warning('Vui lòng nhập phòng thi');
      return false;
    }
    if (this.form.invigilatorCount <= 0) {
      this.notificationService.warning('Số cán bộ coi thi phải lớn hơn 0');
      return false;
    }
    return true;
  }

  submit(): void {
    if (!this.validateForm()) return;

    this.submitting = true;
    const request: CreateExamScheduleRequest = {
      courseId: this.form.courseId!,
      examDate: this.form.examDate,
      examTime: this.form.examTime,
      endTime: this.form.endTime,
      examDay: this.form.examDay,
      examType: this.form.examType,
      room: this.form.room,
      invigilatorCount: this.form.invigilatorCount
    };

    this.examScheduleService.create(request).subscribe({
      next: () => {
        this.notificationService.success('Thêm lịch thi thành công!');
        this.submitting = false;
        this.saved.emit();
        this.closeDialog();
      },
      error: (err) => {
        console.error('Error creating exam schedule:', err);
        this.notificationService.error('Lỗi khi thêm lịch thi');
        this.submitting = false;
      }
    });
  }

  closeDialog(): void {
    this.close.emit();
  }
}
