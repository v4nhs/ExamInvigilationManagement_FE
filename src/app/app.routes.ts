import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  // 1. Chuyển hướng mặc định về trang lịch thi
  {
    path: '',
    redirectTo: '/exam-schedules',
    pathMatch: 'full'
  },
  
  // 2. Route trang đăng nhập
  {
    path: 'login',
    component: LoginComponent
  },

  // 3. Các trang nội bộ
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout.component').then((m: any) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT', 'ROLE_ACCOUNTING'] }
      },
      {
        path: 'department-management',
        loadComponent: () => import('./pages/department-management/department-list.component').then(m => m.DepartmentListComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT'] }
      },
      {
        path: 'user-management',
        loadComponent: () => import('./pages/user-management/user-list.component').then(m => m.UserListComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'user-management/roles',
        loadComponent: () => import('./pages/role-management/role-list.component').then(m => m.RoleListComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'user-management/:id',
        loadComponent: () => import('./pages/user-management/user-detail.component').then(m => m.UserDetailComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'user-management/:id/edit',
        loadComponent: () => import('./pages/user-management/user-edit.component').then(m => m.UserEditComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/course-management/course-list.component').then(m => m.CourseListComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT'] }
      },
      {
        path: 'lecturers',
        loadComponent: () => import('./pages/lecturer-management/lecturer-list.component').then(m => m.LecturerListComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT'] }
      },
      {
        path: 'exam-schedules',
        loadComponent: () => import('./pages/exam-schedule/exam-schedule-list.component').then(m => m.ExamScheduleListComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT', 'ROLE_ACCOUNTING', 'ROLE_USER', 'ROLE_LECTURER'] }
      },
      {
        path: 'my-exam-assignments',
        loadComponent: () => import('./pages/exam-schedule/my-exam-assignments.component').then(m => m.MyExamAssignmentsComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT', 'ROLE_LECTURER'] }
      },
      {
        path: 'exam-assignment',
        loadComponent: () => import('./pages/exam-schedule/exam-assignment-list.component').then(m => m.ExamAssignmentListComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT'] }
      },
      {
        path: 'exam-assignment/:id',
        loadComponent: () => import('./pages/exam-schedule/exam-assignment.component').then(m => m.ExamAssignmentComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_DEPARTMENT'] }
      },
      {
        path: 'payment',
        loadComponent: () => import('./pages/payment-management/payment-list.component').then(m => m.PaymentListComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTING', 'ROLE_DEPARTMENT', 'ROLE_LECTURER'] }
      },
      {
        path: 'payment/:id',
        loadComponent: () => import('./pages/payment-management/lecturer-salary.component').then(m => m.LecturerSalaryComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTING', 'ROLE_DEPARTMENT', 'ROLE_LECTURER'] }
      },
      {
        path: 'payouts',
        loadComponent: () => import('./pages/payment-management/payouts.component').then(m => m.PayoutsComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTING', 'ROLE_DEPARTMENT'] }
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/payment-management/reports.component').then(m => m.ReportsComponent),
        canActivate: [RoleGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTING', 'ROLE_DEPARTMENT', 'ROLE_LECTURER'] }
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/under-development/under-development.component').then(m => m.UnderDevelopmentComponent)
      },
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];