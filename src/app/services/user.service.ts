import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
export interface Role { id: number; name: string; }
export interface User { id: string; username: string; firstName: string; lastName: string; email: string; roles: Role[]; }
export interface UserCreationRequest { username: string; password: string; firstName: string; lastName: string; email: string; roleIds: number[]; }
export interface UserUpdateRequest { password?: string; firstName?: string; lastName?: string; email?: string; roleIds?: number[]; }

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/users';

  // 1. Tạo "kho lưu trữ" dữ liệu ngay trong Service
  private usersSubject = new BehaviorSubject<User[]>([]);
  // 2. Observable này sẽ được Component List subscribe
  users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {}

  // 3. Cập nhật hàm getUsers để tự động đẩy dữ liệu vào Subject
  getUsers(): Observable<User[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        if (response.result) return response.result;
        if (response.data) return response.data;
        if (response.content) return response.content;
        return response;
      }),
      tap(users => this.usersSubject.next(users)) // Phát dữ liệu mới đến tất cả nơi đang lắng nghe
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.result || response)
    );
  }

  // 4. Khi thêm mới, tự động kích hoạt tải lại danh sách
  createUser(request: UserCreationRequest): Observable<User> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map(response => response.result || response),
      tap(() => this.getUsers().subscribe()) // Gọi lại getUsers để cập nhật Subject
    );
  }

  // 5. Khi sửa, tự động kích hoạt tải lại danh sách
  updateUser(id: string, request: UserUpdateRequest): Observable<User> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => response.result || response),
      tap(() => this.getUsers().subscribe())
    );
  }

  // 6. Xử lý xóa và cập nhật UI ngay lập tức mà không cần gọi API load lại (Local Update)
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentUsers = this.usersSubject.value.filter(u => u.id !== id);
        this.usersSubject.next(currentUsers); // Cập nhật mảng hiện tại sau khi xóa
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = 'http://localhost:8080/api/roles'; 

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.result || response.data || response)
    );
  }
}