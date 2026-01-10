import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ExamScheduleService } from '../../services/exam-schedule.service';
import { Router } from '@angular/router';
import { ExamSchedule } from '../../models/exam-schedule.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private examScheduleService = inject(ExamScheduleService);
  public router = inject(Router);

  currentUser$ = this.authService.currentUser$;
  upcomingExams: ExamSchedule[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadUpcomingExams();
  }

  loadUpcomingExams() {
    this.isLoading = true;
    this.examScheduleService.getAll().subscribe({
      next: (exams) => {
        // Filter and sort to get nearest exams
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = exams
          .filter(exam => {
            const examDate = new Date(exam.examDate);
            return examDate >= today;
          })
          .sort((a, b) => {
            const dateA = new Date(a.examDate).getTime();
            const dateB = new Date(b.examDate).getTime();
            return dateA - dateB;
          })
          .slice(0, 5); // Get top 5 nearest exams

        this.upcomingExams = upcoming;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading exam schedules:', err);
        this.isLoading = false;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
