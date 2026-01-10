import { Component, inject } from '@angular/core';
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
  public fb = inject(NonNullableFormBuilder);
  public authService = inject(AuthService);
  public router = inject(Router);

  validateForm = this.fb.group({
    username: this.fb.control('', [Validators.required]),
    password: this.fb.control('', [Validators.required]),
    remember: this.fb.control(true)
  });

  public isLoading = false;
  public errorMessage: string | null = null;

  submitForm(): void {
    if (this.validateForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      this.authService.login({
        username: this.validateForm.value.username!,
        password: this.validateForm.value.password!
      }).subscribe({
        next: (res: any) => { // Dùng any để linh hoạt lấy token
          this.isLoading = false;
          
          // 1. KIỂM TRA VÀ LƯU TOKEN
          // Tuỳ vào backend trả về: res.token hoặc res.result.token
          const token = res.token || res.result?.token; 

          if (token) {
            // Lưu token TRƯỚC khi chuyển trang
            localStorage.setItem('token', token);
            
            // Lưu thông tin user nếu có
            const user = res.user || res.result?.user;
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }

            // 2. CHUYỂN TRANG
            // Chuyển về trang lịch thi
            this.router.navigate(['/exam-schedules']).then(() => {
              console.log('✅ Navigation successful');
            }).catch((err) => {
              console.error('❌ Navigation failed:', err);
            }); 
          } else {
             // Trường hợp API trả về success nhưng không có token
             this.errorMessage = 'Lỗi: Không nhận được Token xác thực!';
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
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