import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
export interface Role { id: number; name: string; }
export interface User { id: string; username: string; firstName: string; lastName: string; email: string; roles: Role[]; }
export interface UserCreationRequest { username: string; password: string; firstName: string; lastName: string; email: string; roleIds: number[]; }
export interface UserUpdateRequest { password?: string; firstName?: string; lastName?: string; email?: string; roleIds?: number[]; }
export interface Page<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

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
      tap(users => this.usersSubject.next(users)) 
    );
  }

  getUserById(id: string): Observable<User> {
    console.log('Calling getUserById with id:', id);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        console.log('getUserById response:', response);
        if (response.result) return response.result;
        if (response.data) return response.data;
        return response;
      })
    );
  }

  // 4. Khi thêm mới, tự động kích hoạt tải lại danh sách
  createUser(request: UserCreationRequest): Observable<User> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map(response => response.result || response),
      tap(() => this.getUsers().subscribe())
    );
  }

  // 5. Khi sửa, tự động kích hoạt tải lại danh sách
  updateUser(id: string, request: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    console.log('Updating user at URL:', url);
    console.log('Request data:', JSON.stringify(request));
    return this.http.put<any>(url, request).pipe(
      map(response => {
        console.log('Update response:', response);
        if (response.result) return response.result;
        if (response.data) return response.data;
        return response;
      }),
      tap(() => {
        console.log('Refreshing user list after update');
        this.getUsers().subscribe();
      })
    );
  }

  // 6. Xử lý xóa và cập nhật UI ngay lập tức mà không cần gọi API load lại (Local Update)
  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentUsers = this.usersSubject.value.filter(u => u.id !== id);
        this.usersSubject.next(currentUsers); 
      })
    );
  }

  getUsersPaginated(page: number = 0, size: number = 10, sortBy: string = 'id', direction: string = 'ASC'): Observable<Page<User>> {
    const params = `?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${direction}`;
    return this.http.get<any>(`${this.apiUrl}/paginated${params}`).pipe(
      map(response => {
        const result = response.result || response.data || response;
        console.log('getUsersPaginated response:', result);
        if (result.content) {
          console.log('First user from paginated:', result.content[0]);
        }
        return result;
      })
    );
  }

  searchUsers(keyword: string, page: number = 0, size: number = 10): Observable<Page<User>> {
    const params = `?keyword=${keyword}&page=${page}&size=${size}`;
    return this.http.get<any>(`${this.apiUrl}/search${params}`).pipe(
      map(response => response.result || response.data || response)
    );
  }

  getAll(): Observable<User[]> {
    return this.getUsers();
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