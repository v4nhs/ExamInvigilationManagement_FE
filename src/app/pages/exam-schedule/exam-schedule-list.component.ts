import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ExamScheduleService } from '../../services/exam-schedule.service';
import { CourseService } from '../../services/course.service';
import { ExamScheduleFormComponent } from './exam-schedule-form.component';
import { ExamSchedule } from '../../models/exam-schedule.models';
import { Course } from '../../models/course.models';

@Component({
  selector: 'app-exam-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ExamScheduleFormComponent],
  templateUrl: './exam-schedule-list.component.html',
  styleUrls: ['./exam-schedule-list.component.css']
})
export class ExamScheduleListComponent implements OnInit {
  schedules: ExamSchedule[] = [];
  courses: Course[] = [];
  loading = false;
  showImportDialog = false;
  showAddForm = false;
  importFile: File | null = null;
  importing = false;

  constructor(
    private examScheduleService: ExamScheduleService,
    private courseService: CourseService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.fetchSchedules();
    this.loadCourses();
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

  fetchSchedules() {
    this.loading = true;
    this.examScheduleService.getAll().subscribe({
      next: (data) => {
        this.schedules = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (!files || files.length === 0) return;

    this.importFile = files[0];
    this.showImportDialog = true;
  }

  confirmImport(): void {
    if (!this.importFile) {
      this.message.warning('Vui lòng chọn file');
      return;
    }

    this.importing = true;
    this.examScheduleService.import(this.importFile).subscribe({
      next: () => {
        this.message.success('Import lịch thi thành công!');
        this.fetchSchedules();
        this.closeImportDialog();
      },
      error: (err) => {
        console.error('Error importing schedules:', err);
        this.message.error('Lỗi khi import file');
        this.importing = false;
      }
    });
  }

  closeImportDialog(): void {
    this.showImportDialog = false;
    this.importFile = null;
    this.importing = false;
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

  getCourseName(courseId: number): string {
    const course = this.courses.find(c => c.id === courseId);
    return course ? course.name : 'N/A';
  }
}
