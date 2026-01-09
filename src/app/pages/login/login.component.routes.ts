import { Routes } from '@angular/router';
import { LoginComponent } from './login.component';

export const LOGIN_ROUTES: Routes = [{ path: '', component: LoginComponent }];

export class AuthService {
  private apiUrl = 'http://localhost:8080/api/login';
}