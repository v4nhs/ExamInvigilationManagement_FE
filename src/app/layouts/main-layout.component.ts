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
  
  // Khai báo kiểu dữ liệu rõ ràng (User | null hoặc any)
  currentUser: User | null = null; 

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Lấy user hiện tại khi load trang
    this.currentUser = this.authService.getCurrentUser();

    // 2. SỬA LỖI TS7006: Thêm kiểu dữ liệu (user: any) hoặc (user: User)
    this.authService.currentUser$.subscribe((user: User | null) => {
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
}