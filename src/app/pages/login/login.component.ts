import { Component, inject } from '@angular/core'; // ✅ 1. Thêm 'inject'
import { CommonModule } from '@angular/common';
import { 
  ReactiveFormsModule, 
  NonNullableFormBuilder, 
  Validators 
} from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    NzFormModule, 
    NzInputModule, 
    NzButtonModule, 
    NzCheckboxModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})

export class LoginComponent {
  private fb = inject(NonNullableFormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  validateForm = this.fb.group({
    username: this.fb.control('', [Validators.required]),
    password: this.fb.control('', [Validators.required]),
    remember: this.fb.control(true)
  });

  isLoading = false;
  errorMessage: string | null = null;

  submitForm(): void {
    if (this.validateForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.authService.login({
        username: this.validateForm.value.username!,
        password: this.validateForm.value.password!
      }).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.authenticated) {
            this.router.navigate(['/home']);
          } else {
            this.errorMessage = 'Đăng nhập thất bại!';
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Sai tài khoản hoặc mật khẩu!';
        }
      });
    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}

