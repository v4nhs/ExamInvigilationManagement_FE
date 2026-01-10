import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
// 1. Sửa lỗi import: catchError phải được import từ 'rxjs/operators'
import { map, catchError } from 'rxjs/operators'; 

export interface Role {
  id: number;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = 'http://localhost:8080/api/roles'; 

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        // Trả về mảng rỗng nếu không có dữ liệu
        if (!res) return [];
        // Ưu tiên lấy từ res.result nếu Backend bọc dữ liệu, nếu không lấy res.data hoặc chính res (nếu là mảng)
        return res.result || res.data || (Array.isArray(res) ? res : []);
      }),
      // 2. Sửa lỗi TS7006: Định nghĩa kiểu dữ liệu cho 'err' là HttpErrorResponse
      catchError((err: HttpErrorResponse) => {
        console.error('Lỗi lấy roles:', err);
        // Trả về mảng rỗng qua throwError để Component không bị crash nếu cần, 
        // hoặc ném lỗi để Interceptor xử lý (như 401 Unauthorized)
        return throwError(() => err);
      })
    );
  }

  getRoleById(id: number): Observable<Role> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.result || res),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<any>(this.apiUrl, role).pipe(
      map(res => res.result || res),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  updateRole(id: number, role: Role): Observable<Role> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, role).pipe(
      map(res => res.result || res),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }
}