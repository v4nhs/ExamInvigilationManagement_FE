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
export class RoleService {
  private apiUrl = 'http://localhost:8080/api/roles'; 

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Role[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => {
        if (!res) return [];
        return res.result || res.data || (Array.isArray(res) ? res : []);
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Lỗi lấy roles:', err);
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

  getRolesPaginated(page: number = 0, size: number = 10, sortBy: string = 'id', direction: string = 'ASC'): Observable<Page<Role>> {
    const params = `?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${direction}`;
    return this.http.get<any>(`${this.apiUrl}/paginated${params}`).pipe(
      map(res => res.result || res.data || res),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  searchRoles(keyword: string, page: number = 0, size: number = 10): Observable<Page<Role>> {
    const params = `?keyword=${keyword}&page=${page}&size=${size}`;
    return this.http.get<any>(`${this.apiUrl}/search${params}`).pipe(
      map(res => res.result || res.data || res),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }
}