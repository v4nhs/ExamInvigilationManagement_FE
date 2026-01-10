import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // 1. Chuyển hướng mặc định về trang lịch thi
  {
    path: '',
    redirectTo: '/exam-schedules',
    pathMatch: 'full'
  },
  
  // 2. Route trang đăng nhập (Nằm ngoài Layout chính)
  {
    path: 'login',
    component: LoginComponent
  },

  // 3. Các trang nội bộ (Nằm trong Main Layout)
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
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'department-management',
        loadComponent: () => import('./pages/department-management/department-list.component').then(m => m.DepartmentListComponent)
      },
      {
        path: 'user-management',
        loadComponent: () => import('./pages/user-management/user-list.component').then(m => m.UserListComponent)
      },
      // Lưu ý: Route cụ thể 'roles' phải đặt TRƯỚC route có tham số ':id'
      {
        path: 'user-management/roles',
        loadComponent: () => import('./pages/role-management/role-list.component').then(m => m.RoleListComponent)
      },
      // Route có tham số :id (đặt sau các route cụ thể)
      {
        path: 'user-management/:id',
        loadComponent: () => import('./pages/user-management/user-detail.component').then(m => m.UserDetailComponent)
      },
      {
        path: 'user-management/:id/edit',
        loadComponent: () => import('./pages/user-management/user-edit.component').then(m => m.UserEditComponent)
      },
      {
        path: 'courses',
        loadComponent: () => import('./pages/course-management/course-list.component').then(m => m.CourseListComponent)
      },
      {
        path: 'lecturers',
        loadComponent: () => import('./pages/lecturer-management/lecturer-list.component').then(m => m.LecturerListComponent)
      },
      {
        path: 'exam-schedules',
        loadComponent: () => import('./pages/exam-schedule/exam-schedule-list.component').then(m => m.ExamScheduleListComponent)
      },
      {
        path: 'exam-assignment',
        loadComponent: () => import('./pages/exam-schedule/exam-assignment-list.component').then(m => m.ExamAssignmentListComponent)
      },
      {
        path: 'exam-assignment/:id',
        loadComponent: () => import('./pages/exam-schedule/exam-assignment.component').then(m => m.ExamAssignmentComponent)
      },
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];