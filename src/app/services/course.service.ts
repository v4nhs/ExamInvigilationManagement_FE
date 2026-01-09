import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CourseRequest, CourseResponse } from '../models/course.models';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = 'http://localhost:8080/api/courses';

  constructor(private http: HttpClient) {}

  getAll(): Observable<CourseResponse[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      // unwrap ApiResponse
      map((res: any) => res.data as CourseResponse[])
    );
  }

  getById(id: number): Observable<CourseResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => res.data as CourseResponse)
    );
  }

  create(request: CourseRequest): Observable<CourseResponse> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map((res: any) => res.data as CourseResponse)
    );
  }

  update(id: number, request: CourseRequest): Observable<CourseResponse> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, request).pipe(
      map((res: any) => res.data as CourseResponse)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined)
    );
  }

  importCourses(departmentId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('departmentId', departmentId.toString());
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData);
  }
}
