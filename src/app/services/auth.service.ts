import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthRequest, AuthResponse, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && !!window.localStorage;
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, request)
      .pipe(
        tap(response => {
          if (response && response.token && this.isBrowser()) {
            localStorage.setItem('token', response.token);
            this.loadUserFromToken();
          }
        })
      );
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadUserFromToken(): void {
    const user = this.getUserFromToken();
    this.currentUserSubject.next(user);
  }

  private getUserFromToken(): User | null {
    if (!this.isBrowser()) return null;
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    try {
      // Decode JWT token (basic implementation)
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return {
        id: decoded.sub || decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
