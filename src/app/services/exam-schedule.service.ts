import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, timeout, catchError } from 'rxjs/operators';
import { ExamSchedule, CreateExamScheduleRequest, AssignLecturerRequest, ExamAssignment, AvailableLecturer } from '../models/exam-schedule.models';

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
export class ExamScheduleService {
  private apiUrl = 'http://localhost:8080/api/exam-schedules';

  private schedulesSubject = new BehaviorSubject<ExamSchedule[]>([]);
  schedules$ = this.schedulesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAll(): Observable<ExamSchedule[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      timeout(10000),
      map((res: any) => {
        console.log('Raw API response:', res);
        let data = res;
        if (res.result) data = res.result;
        else if (res.data) data = res.data;
        else if (res.content) data = res.content;
        
        // Ensure we always return an array
        if (!Array.isArray(data)) {
          console.warn('Response is not an array:', data);
          data = [];
        }
        
        // Map API response to model
        const mapped = data.map((schedule: any) => ({
          id: schedule.id,
          course: schedule.course,
          courseId: schedule.courseId || schedule.course?.id,
          courseName: schedule.courseName || schedule.course?.name || '-',
          courseCode: schedule.courseCode || schedule.course?.code || '-',
          examDate: schedule.examDate || schedule.exam_date,
          examDay: schedule.examDay || schedule.exam_day,
          examTime: schedule.examTime || schedule.exam_time,
          endTime: schedule.endTime || schedule.end_time,
          examType: schedule.examType || schedule.exam_type,
          room: schedule.room,
          studentCount: schedule.studentCount || schedule.student_count,
          invigilatorCount: schedule.invigilatorCount || schedule.invigilator_count,
          description: schedule.description,
          status: schedule.status || 'PLANNED'
        }));
        
        console.log('Mapped data:', mapped);
        return mapped;
      }),
      tap(schedules => {
        console.log('Schedules after tap:', schedules);
        if (Array.isArray(schedules)) {
          this.schedulesSubject.next(schedules);
        }
      }),
      catchError(err => {
        console.error('Error fetching exam schedules:', err);
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<ExamSchedule> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((res: any) => res.result || res.data || res)
    );
  }

  create(request: CreateExamScheduleRequest): Observable<ExamSchedule> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map((res: any) => res.result || res.data || res),
      tap(() => this.getAll().subscribe())
    );
  }

  getAvailableLecturers(id: number): Observable<AvailableLecturer[]> {
    return this.http.get<any>(`${this.apiUrl}/${id}/available-lecturers`).pipe(
      map((res: any) => {
        if (res.result) return res.result;
        if (res.data) return res.data;
        if (res.content) return res.content;
        return res;
      })
    );
  }

  getAssignedLecturers(id: number): Observable<number[]> {
    return this.http.get<any>(`${this.apiUrl}/${id}/assigned-lecturers`).pipe(
      map((res: any) => {
        if (res.result) return res.result;
        if (res.data) return res.data;
        if (res.content) return res.content;
        return res || [];
      }),
      catchError(() => of([]))
    );
  }

  assignWritten(id: number, request: AssignLecturerRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/assign-written`, request).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  assignOther(id: number, request: AssignLecturerRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/assign-other`, request).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  unassignLecturer(id: number, lecturerId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}/assign/${lecturerId}`).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  import(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/import`, formData).pipe(
      tap(() => this.getAll().subscribe())
    );
  }

  getSchedulesPaginated(page: number = 0, size: number = 10, sortBy: string = 'id', direction: string = 'DESC'): Observable<Page<ExamSchedule>> {
    const params = `?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${direction}`;
    return this.http.get<any>(`${this.apiUrl}/paginated${params}`).pipe(
      map((res: any) => res.result || res.data || res)
    );
  }

  searchSchedules(keyword: string, page: number = 0, size: number = 10): Observable<Page<ExamSchedule>> {
    const params = `?keyword=${keyword}&page=${page}&size=${size}`;
    return this.http.get<any>(`${this.apiUrl}/search${params}`).pipe(
      map((res: any) => res.result || res.data || res)
    );
  }

  getLecturersForSchedule(scheduleId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/${scheduleId}/assigned-lecturers`).pipe(
      map((res: any) => {
        if (res.result) return res.result;
        if (res.data) return res.data;
        if (res.content) return res.content;
        if (Array.isArray(res)) return res;
        return [];
      }),
      catchError((err) => {
        console.error('Error fetching lecturers for schedule:', err);
        return of([]);
      })
    );
  }
}
