import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  // 1. SỬA: Chuyển hướng mặc định về Login thay vì Home
  {
    path: '',
    redirectTo: '/login',
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
        path: 'user-management',
        loadComponent: () => import('./pages/user-management/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'user-management/add',
        loadComponent: () => import('./pages/user-management/user-add.component').then(m => m.UserAddComponent)
      },
      // Lưu ý: Route cụ thể 'roles' phải đặt TRƯỚC route có tham số ':id'
      {
        path: 'user-management/roles',
        loadComponent: () => import('./pages/role-management/role-list.component').then(m => m.RoleListComponent)
      },
      {
        path: 'user-management/roles/add',
        loadComponent: () => import('./pages/role-management/role-form.component').then(m => m.RoleFormComponent)
      },
      {
        path: 'user-management/roles/edit/:id',
        loadComponent: () => import('./pages/role-management/role-form.component').then(m => m.RoleFormComponent)
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
    ]
  },

  {
    path: '**',
    redirectTo: '/login'
  }
];