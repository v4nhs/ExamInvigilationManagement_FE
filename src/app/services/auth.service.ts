import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthRequest, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Đảm bảo đúng URL Backend
  private apiUrl = 'http://localhost:8080/api/auth';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    if (this.isBrowser()) {
      this.loadUserFromToken();
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  // --- 1. ĐĂNG NHẬP ---
  login(request: AuthRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/authenticate`, request)
      .pipe(
        tap(response => {
          console.log("🔥 Phản hồi từ Server:", response); // Log để kiểm tra

          if (this.isBrowser()) {
            // Backend trả về phẳng: { token: '...', refreshToken: null, ... }
            // Nên ta lấy trực tiếp response, hoặc response.result nếu có bọc
            const data = response.result || response;
            
            // Lấy token (chấp nhận accessToken hoặc token)
            const accessToken = data.token || data.accessToken;
            const refreshToken = data.refreshToken;

            if (accessToken) {
              console.log("✅ Đã tìm thấy Access Token, đang lưu...");
              // Gọi hàm lưu, bất kể refreshToken có null hay không
              this.saveTokens(accessToken, refreshToken);
            } else {
              console.error("❌ Server không trả về Token nào cả!");
            }
          }
        })
      );
  }
  saveTokens(accessToken: string, refreshToken: string | null) {
    if (!this.isBrowser()) return;

    // 1. Lưu Access Token (Bắt buộc) - Dùng sessionStorage để xóa khi đóng tab
    sessionStorage.setItem('token', accessToken);
    console.log("💾 Đã lưu Access Token vào SessionStorage");

    // 2. Lưu Refresh Token (Nếu có) - Dùng sessionStorage
    if (refreshToken && refreshToken !== 'null') {
      sessionStorage.setItem('refreshToken', refreshToken);
      console.log("💾 Đã lưu Refresh Token");
    } else {
      console.warn("⚠️ Cảnh báo: Server trả về refreshToken là NULL. Tính năng tự gia hạn token sẽ không hoạt động.");
    }
    
    // Cập nhật thông tin user lên Header
    this.loadUserFromToken();
  }

  // --- 2. ĐĂNG XUẤT ---
  logout(): void {
    if (this.isBrowser()) {
      // Xóa tokens từ sessionStorage, giữ lại remember_me trong localStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refreshToken');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // --- 3. REFRESH TOKEN ---
  refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    return this.http.post<any>(`${this.apiUrl}/refresh`, {
      refreshToken: refreshToken
    });
  }
  // --- 4. CÁC HÀM HỖ TRỢ (Gồm hàm isAuthenticated bị thiếu) ---

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return sessionStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return sessionStorage.getItem('refreshToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Role checking methods
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ROLE_ADMIN';
  }

  isDepartment(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ROLE_DEPARTMENT';
  }

  isAccounting(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ROLE_ACCOUNTING';
  }

  isLecturer(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ROLE_LECTURER';
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    const normalizedRole = role.startsWith('ROLE_') ? role : 'ROLE_' + role.toUpperCase();
    return user?.role === normalizedRole;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  private loadUserFromToken(): void {
    if (!this.isBrowser()) return;

    const token = sessionStorage.getItem('token');
    if (!token) {
      // Không log warning nếu app vừa khởi động (bình thường lần đầu không có token)
      this.currentUserSubject.next(null);
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const decoded = JSON.parse(jsonPayload);
      console.log('🔐 Token decoded:', decoded);

      // Handle role - could be in different formats
      let role = decoded.roles || decoded.role || 'USER';
      
      // If role is an array, get first one
      if (Array.isArray(role)) {
        role = role[0];
      }
      
      // Ensure role starts with ROLE_ prefix
      if (role && !role.startsWith('ROLE_')) {
        role = 'ROLE_' + role.toUpperCase();
      } else if (role) {
        role = role.toUpperCase();
      }

      const user: User = {
        id: decoded.id || decoded.sub,
        username: decoded.username || decoded.sub,
        email: decoded.email,
        role: role
      };

      console.log('✅ User from token:', user);
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('❌ Lỗi giải mã token:', error);
      this.currentUserSubject.next(null);
    }
  }
}