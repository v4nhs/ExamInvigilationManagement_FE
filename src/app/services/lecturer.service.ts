import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Lecturer, LecturerRequest, LecturerResponse } from '../models/lecturer.models';

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
export class LecturerService {
  private apiUrl = 'http://localhost:8080/api/lecturers';

  private lecturersSubject = new BehaviorSubject<Lecturer[]>([]);
  lecturers$ = this.lecturersSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<Lecturer[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((res: any) => {
        if (res.result) return res.result;
        if (res.data) return res.data;
        if (res.content) return res.content;
        return res;
      }),
      tap(lecturers => this.lecturersSubject.next(lecturers))
    );
  }

  getById(id: number): Observable<LecturerResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => res.result || res.data || res)
    );
  }

  create(request: LecturerRequest): Observable<LecturerResponse> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map((res: any) => res.result || res.data || res),
      tap(() => this.getAll().subscribe())
    );
  }

  update(id: number, request: LecturerRequest): Observable<LecturerResponse> {
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

  getLecturersPaginated(page: number = 0, size: number = 10, sortBy: string = 'id', direction: string = 'ASC'): Observable<Page<Lecturer>> {
    const params = `?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${direction}`;
    return this.http.get<any>(`${this.apiUrl}/paginated${params}`).pipe(
      map((res: any) => res.result || res.data || res)
    );
  }

  searchLecturers(keyword: string, page: number = 0, size: number = 10): Observable<Page<Lecturer>> {
    const params = `?keyword=${keyword}&page=${page}&size=${size}`;
    return this.http.get<any>(`${this.apiUrl}/search${params}`).pipe(
      map((res: any) => res.result || res.data || res)
    );
  }
}
