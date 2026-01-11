import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Course, CourseRequest, CourseResponse } from '../models/course.models';

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
export class CourseService {
  private apiUrl = 'http://localhost:8080/api/courses';

  private coursesSubject = new BehaviorSubject<Course[]>([]);
  courses$ = this.coursesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<Course[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res: any) => {
        if (res.result) return res.result;
        if (res.data) return res.data;
        if (res.content) return res.content;
        return res;
      }),
      tap(courses => this.coursesSubject.next(courses))
    );
  }

  getById(id: number): Observable<CourseResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => res.result || res.data || res)
    );
  }

  create(request: CourseRequest): Observable<CourseResponse> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map((res: any) => res.result || res.data || res),
      tap(() => this.getAll().subscribe())
    );
  }

  update(id: number, request: CourseRequest): Observable<CourseResponse> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request).pipe(
      map((res: any) => res.result || res.data || res),
      tap(() => this.getAll().subscribe())
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  import(departmentId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('departmentId', departmentId.toString());
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  getCoursesPaginated(page: number = 0, size: number = 10, sortBy: string = 'id', direction: string = 'ASC'): Observable<Page<Course>> {
    const params = `?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${direction}`;
    return this.http.get<any>(`${this.apiUrl}/paginated${params}`).pipe(
      map((res: any) => res.result || res.data || res)
    );
  }

  searchCourses(keyword: string, page: number = 0, size: number = 10): Observable<Page<Course>> {
    const params = `?keyword=${keyword}&page=${page}&size=${size}`;
    return this.http.get<any>(`${this.apiUrl}/search${params}`).pipe(
      map((res: any) => res.result || res.data || res)
    );
  }
}
