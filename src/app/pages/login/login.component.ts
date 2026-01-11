import { Component, inject, OnInit } from '@angular/core';
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
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EncryptionService } from '../../services/encryption.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    NzFormModule, 
    NzInputModule, 
    NzButtonModule, 
    NzCheckboxModule,
    NzIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  public fb = inject(NonNullableFormBuilder);
  public authService = inject(AuthService);
  public router = inject(Router);
  public encryptionService = inject(EncryptionService);
  public notificationService = inject(NotificationService);

  validateForm = this.fb.group({
    username: this.fb.control('', [Validators.required]),
    password: this.fb.control('', [Validators.required]),
    remember: this.fb.control(false)
  });

  public isLoading = false;
  public errorMessage: string | null = null;
  public passwordVisible = false;

  ngOnInit(): void {
    this.loadSavedUsername();
  }

  loadSavedUsername(): void {
    if (typeof window === 'undefined') return; // Check nếu là server-side
    
    const savedUsername = localStorage.getItem('remember_username');
    const savedPassword = localStorage.getItem('remember_password');
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    
    if (savedUsername && rememberMe) {
      this.validateForm.patchValue({
        username: savedUsername,
        remember: true
      });
      
      // Nếu có mật khẩu lưu, giải mã và điền vào
      if (savedPassword) {
        try {
          const decodedPassword = this.encryptionService.decrypt(savedPassword);
          this.validateForm.patchValue({
            password: decodedPassword
          });
          console.log('✅ Đã load username và mật khẩu từ lưu trữ');
        } catch (e) {
          console.warn('⚠️ Lỗi giải mã mật khẩu:', e);
        }
      }
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      const remember = this.validateForm.value.remember;

      this.authService.login({
        username: this.validateForm.value.username!,
        password: this.validateForm.value.password!
      }).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          
          // 1. KIỂM TRA VÀ LƯU TOKEN
          const token = res.token || res.result?.token; 

          if (token) {
            if (typeof window !== 'undefined') {
              // Lưu token
              sessionStorage.setItem('token', token);
              
              // Lưu thông tin user nếu có
              const user = res.user || res.result?.user;
              if (user) {
                sessionStorage.setItem('user', JSON.stringify(user));
              }

              // 2. LƯU "GHI NHỚ TÔI" NẾU CHECKED
              if (remember) {
                localStorage.setItem('remember_username', this.validateForm.value.username!);
                // Mã hóa mật khẩu AES256 trước khi lưu (an toàn hơn base64)
                const encryptedPassword = this.encryptionService.encrypt(this.validateForm.value.password!);
                localStorage.setItem('remember_password', encryptedPassword);
                localStorage.setItem('remember_me', 'true');
                console.log('✅ Đã lưu tài khoản và mật khẩu được mã hóa');
              } else {
                // Xóa saved credentials nếu bỏ check
                localStorage.removeItem('remember_username');
                localStorage.removeItem('remember_password');
                localStorage.removeItem('remember_me');
                console.log('✅ Đã xóa tài khoản lưu trữ');
              }
            }

            // ✅ Hiển thị thông báo thành công
            this.notificationService.success(`👋 Chào mừng ${this.validateForm.value.username}! Đăng nhập thành công`, 2000);

            // 3. CHUYỂN TRANG
            this.router.navigate(['/exam-schedules']).then(() => {
              console.log('✅ Navigation successful');
            }).catch((err) => {
              console.error('❌ Navigation failed:', err);
            }); 
          } else {
             this.errorMessage = 'Lỗi: Không nhận được Token xác thực!';
             this.notificationService.error('❌ Lỗi: Không nhận được Token xác thực!', 3000);
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          const errorMsg = err?.error?.message || 'Sai tài khoản hoặc mật khẩu!';
          this.errorMessage = errorMsg;
          this.notificationService.error(`❌ ${errorMsg}`, 3000);
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