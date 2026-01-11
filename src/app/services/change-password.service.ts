import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {
  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient) { }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, request);
  }
}
