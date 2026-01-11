import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ExamScheduleService } from '../../services/exam-schedule.service';
import { LecturerService } from '../../services/lecturer.service';
import { UserService } from '../../services/user.service';
import { DepartmentService } from '../../services/department.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalExamSchedules = 0;
  totalLecturers = 0;
  totalUsers = 0;
  totalDepartments = 0;
  loading = true;
  error: string | null = null;

  // Chart data
  lecturerByDeptData: Array<{ name: string; value: number; percentage: number }> = [];
  userByRoleData: Array<{ name: string; value: number; percentage: number }> = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private examScheduleService: ExamScheduleService,
    private lecturerService: LecturerService,
    private userService: UserService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;
    let completedRequests = 0;
    const totalRequests = 4;

    const finishLoading = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loading = false;
      }
    };

    // Load exam schedules
    this.examScheduleService.getAll().subscribe(
      (data: any) => {
        const exams = Array.isArray(data) ? data : [];
        this.totalExamSchedules = exams.length;
        finishLoading();
      },
      (error: any) => {
        console.error('Error loading exam schedules:', error);
        this.totalExamSchedules = 0;
        finishLoading();
      }
    );

    // Load lecturers
    this.lecturerService.getAll().subscribe(
      (data: any) => {
        const lecturers = Array.isArray(data) ? data : [];
        this.totalLecturers = lecturers.length;
        this.generateLecturerChartData(lecturers);
        finishLoading();
      },
      (error: any) => {
        console.error('Error loading lecturers:', error);
        this.totalLecturers = 0;
        finishLoading();
      }
    );

    // Load users
    this.userService.getUsers().subscribe(
      (data: any) => {
        const users = Array.isArray(data) ? data : [];
        this.totalUsers = users.length;
        this.generateUserChartData(users);
        finishLoading();
      },
      (error: any) => {
        console.error('Error loading users:', error);
        this.totalUsers = 0;
        finishLoading();
      }
    );

    // Load departments
    this.departmentService.getAll().subscribe(
      (data: any) => {
        const departments = Array.isArray(data) ? data : [];
        this.totalDepartments = departments.length;
        finishLoading();
      },
      (error: any) => {
        console.error('Error loading departments:', error);
        this.totalDepartments = 0;
        finishLoading();
      }
    );
  }

  // Generate chart data cho giảng viên theo khoa
  generateLecturerChartData(lecturers: any[]): void {
    const deptCount: { [key: string]: number } = {};

    lecturers?.forEach((lecturer: any) => {
      try {
        const deptName = lecturer.departmentName || lecturer.department?.name || 'Chưa xác định';
        deptCount[deptName] = (deptCount[deptName] || 0) + 1;
      } catch (e) {
        console.error('Error processing lecturer:', e);
      }
    });

    const total = Object.values(deptCount).reduce((a: number, b: number) => a + b, 0) || 1;
    
    this.lecturerByDeptData = Object.entries(deptCount)
      .map(([name, value]) => ({
        name,
        value: value as number,
        percentage: Math.round(((value as number) / total) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  }

  // Generate chart data cho người dùng theo vai trò
  generateUserChartData(users: any[]): void {
    const roleCount: { [key: string]: number } = {};

    users?.forEach((user: any) => {
      try {
        const roles = user.roles || [];
        if (Array.isArray(roles) && roles.length > 0) {
          const roleName = roles[0].name || 'Unknown';
          roleCount[roleName] = (roleCount[roleName] || 0) + 1;
        } else {
          roleCount['Chưa gán vai trò'] = (roleCount['Chưa gán vai trò'] || 0) + 1;
        }
      } catch (e) {
        console.error('Error processing user:', e);
      }
    });

    const total = Object.values(roleCount).reduce((a: number, b: number) => a + b, 0) || 1;
    
    this.userByRoleData = Object.entries(roleCount)
      .map(([name, value]) => ({
        name,
        value: value as number,
        percentage: Math.round(((value as number) / total) * 100)
      }))
      .sort((a, b) => b.value - a.value);
  }

  // Get bar width percentage for chart
  getBarWidth(percentage: number): number {
    return percentage;
  }

  // Get color for bar
  getBarColor(index: number): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];
    return colors[index % colors.length];
  }

  // Check if user is lecturer
  isLecturer(): boolean {
    return this.authService.isLecturer();
  }

  // Navigate to personal exam schedule
  goToPersonalSchedule(): void {
    this.router.navigate(['/exam-schedules']);
  }
}



