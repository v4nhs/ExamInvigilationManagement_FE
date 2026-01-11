import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// Import các module của NG-ZORRO
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

// 1. SỬA ĐƯỜNG DẪN IMPORT (chỉ dùng 1 dấu ../)
import { AuthService } from '../services/auth.service'; 
// Import interface User để sửa lỗi kiểu dữ liệu (nếu file này tồn tại ở ../models/auth.models)
// Nếu chưa có file models, bạn có thể xóa dòng import User và dùng 'any' bên dưới
import { User } from '../models/auth.models'; 

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzButtonModule,
    NzDropDownModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent implements OnInit {
  isCollapsed = false;
  showDropdown = false;
  isMobile = false;
  sidebarOpen = false;
  
  // Khai báo kiểu dữ liệu rõ ràng (User | null hoặc any)
  currentUser: User | null = null; 

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());
  }

  ngOnInit() {
    // First, try to get user from service (from token)
    const user = this.authService.getCurrentUser();
    console.log('🔍 getCurrentUser() result:', user);
    
    if (user) {
      this.currentUser = user;
      console.log('✅ User loaded from getCurrentUser:', this.currentUser);
    }

    // Also subscribe to observable for real-time updates
    this.authService.currentUser$.subscribe((user: User | null) => {
      console.log('📡 Observable updated with user:', user);
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
    this.currentUser = null;
    this.showDropdown = false;
    // Chuyển hướng về login
    this.router.navigate(['/login']);
  }

  // ===== ROLE CHECKING METHODS =====
  hasRole(role: string): boolean {
    if (!this.currentUser) {
      console.warn('⚠️ currentUser is null');
      return false;
    }
    const userRole = this.currentUser.role?.toUpperCase() || '';
    const result = userRole === role.toUpperCase();
    console.log(`🔍 hasRole('${role}'): user has '${userRole}' -> ${result}`);
    return result;
  }

  hasAnyRole(...roles: string[]): boolean {
    if (!this.currentUser) {
      console.warn('⚠️ currentUser is null');
      return false;
    }
    const userRole = this.currentUser.role?.toUpperCase() || '';
    const result = roles.some(role => role.toUpperCase() === userRole);
    console.log(`🔍 hasAnyRole(${roles.join(', ')}): user has '${userRole}' -> ${result}`);
    return result;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isDepartment(): boolean {
    return this.hasRole('ROLE_DEPARTMENT');
  }

  isAccounting(): boolean {
    return this.hasRole('ROLE_ACCOUNTING');
  }

  checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  isStaffOrAbove(): boolean {
    return this.hasAnyRole('ROLE_ADMIN', 'ROLE_DEPARTMENT', 'ROLE_STAFF');
  }

  // ===== PAYMENT MENU CLICK HANDLERS =====
  onPaymentMenuClick(menuItem: string): void {
    console.log(`📌 Clicked on payment menu item: ${menuItem}`);
    
    switch(menuItem) {
      case 'payment':
        this.router.navigate(['/payment']);
        console.log('🎯 Navigating to: /payment (Danh sách thanh toán)');
        break;
      case 'payouts':
        this.router.navigate(['/payouts']);
        console.log('🎯 Navigating to: /payouts (Thống kê)');
        break;
      case 'reports':
        this.router.navigate(['/reports']);
        console.log('🎯 Navigating to: /reports (Báo cáo)');
        break;
      default:
        console.warn(`⚠️ Unknown payment menu item: ${menuItem}`);
    }
  }
}