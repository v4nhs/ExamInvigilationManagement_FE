import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatisticsData {
  totalExamSchedules: number;
  totalLecturers: number;
  totalUsers: number;
  totalDepartments: number;
  examSchedulesByMonth: ExamCountByMonth[];
  lecturersByDepartment: LecturerCountByDept[];
  usersByRole: UserCountByRole[];
}

export interface ExamCountByMonth {
  month: string;
  count: number;
}

export interface LecturerCountByDept {
  departmentName: string;
  count: number;
}

export interface UserCountByRole {
  roleName: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = 'http://localhost:8080/api/statistics';

  constructor(private http: HttpClient) { }

  getStatistics(): Observable<StatisticsData> {
    return this.http.get<StatisticsData>(`${this.apiUrl}/dashboard`);
  }

  getExamScheduleCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/exam-schedules/count`);
  }

  getLecturerCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/lecturers/count`);
  }

  getUserCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/users/count`);
  }

  getDepartmentCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/departments/count`);
  }
}
