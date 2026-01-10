import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Department, DepartmentRequest, DepartmentResponse } from '../models/department.models';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = 'http://localhost:8080/api/departments';

  // Store departments data
  private departmentsSubject = new BehaviorSubject<Department[]>([]);
  departments$ = this.departmentsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get all departments
   */
  getAll(): Observable<Department[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        if (response.result) return response.result;
        if (response.data) return response.data;
        if (response.content) return response.content;
        return response;
      }),
      tap(departments => this.departmentsSubject.next(departments))
    );
  }

  /**
   * Get department by ID
   */
  getById(id: number): Observable<Department> {
    if (!id) {
      console.error('Department ID is null or undefined:', id);
      throw new Error('Department ID is required');
    }
    console.log('Getting department by id:', id);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.result || response)
    );
  }

  /**
   * Create new department
   */
  create(request: DepartmentRequest): Observable<DepartmentResponse> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map(response => response.result || response),
      tap(() => this.getAll().subscribe())
    );
  }

  /**
   * Update department
   */
  update(id: number, request: DepartmentRequest): Observable<DepartmentResponse> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request).pipe(
      map(response => response.result || response),
      tap(() => this.getAll().subscribe())
    );
  }

  /**
   * Delete department
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getAll().subscribe())
    );
  }
}
