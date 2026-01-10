import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';

// Biến toàn cục quản lý trạng thái
let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('Interceptor đang chạy cho URL:', req.url);
  console.log('Token hiện tại:', token ? 'Có token' : 'Không có token');
  const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

  // 1. Chỉ gắn Token nếu không phải là request Login/Refresh
  if (token && !isAuthRequest) {
    req = addToken(req, token);
  }

  return next(req).pipe(
    catchError(error => {
      // 2. Nếu lỗi 401 và KHÔNG PHẢI lỗi từ chính request Login/Refresh
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthRequest) {
        return handle401Error(req, next, authService);
      }
      return throwError(() => error);
    })
  );
};

// Hàm gắn Token vào Header
const addToken = (req: HttpRequest<any>, token: string): HttpRequest<any> => {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  });
}

// Hàm xử lý Refresh Token
const handle401Error = (
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService
): Observable<HttpEvent<any>> => {

  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        isRefreshing = false;

        // --- QUAN TRỌNG: Xử lý linh hoạt cấu trúc response ---
        // API có thể trả về: response.result.token HOẶC response.token
        const data = response.result || response;
        const newToken = data.token || data.accessToken;
        const newRefreshToken = data.refreshToken;

        if (!newToken) {
            // Nếu API báo thành công (200) nhưng không có token -> Coi như thất bại
            authService.logout();
            return throwError(() => new Error('Không tìm thấy token mới trong phản hồi'));
        }

        // Lưu token mới
        authService.saveTokens(newToken, newRefreshToken);
        
        // Phát tín hiệu cho các request đang chờ
        refreshTokenSubject.next(newToken);

        // Thực hiện lại request ban đầu với token mới
        return next(addToken(req, newToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        // Nếu Refresh Token cũng hết hạn hoặc lỗi -> Đăng xuất bắt buộc
        authService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Nếu đang có tiến trình refresh khác chạy, đợi nó xong
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        return next(addToken(req, jwt as string));
      })
    );
  }
}