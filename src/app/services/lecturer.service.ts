import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Lecturer, LecturerRequest, LecturerResponse } from '../models/lecturer.models';

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
}
