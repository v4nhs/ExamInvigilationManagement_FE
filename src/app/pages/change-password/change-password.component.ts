import { Component, inject, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { ChangePasswordService } from '../../services/change-password.service';

// Custom validator để kiểm tra mật khẩu xác nhận
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');

  if (!newPassword || !confirmPassword) {
    return null;
  }

  return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzIconModule, NzButtonModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  @Output() closeEvent = new EventEmitter<void>();

  fb = inject(FormBuilder);
  changePasswordService = inject(ChangePasswordService);

  changePasswordForm = this.fb.group(
    {
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: passwordMatchValidator }
  );

  oldPasswordVisible = false;
  newPasswordVisible = false;
  confirmPasswordVisible = false;

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  toggleOldPasswordVisibility(): void {
    this.oldPasswordVisible = !this.oldPasswordVisible;
  }

  toggleNewPasswordVisibility(): void {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  submitForm(): void {
    if (this.changePasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const request = {
        oldPassword: this.changePasswordForm.value.oldPassword!,
        newPassword: this.changePasswordForm.value.newPassword!,
        confirmPassword: this.changePasswordForm.value.confirmPassword!
      };

      this.changePasswordService.changePassword(request).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.successMessage = 'Đổi mật khẩu thành công!';
          this.changePasswordForm.reset();

          // Đóng modal sau 1.5 giây
          setTimeout(() => {
            this.closeModal();
          }, 1500);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error?.error?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!';
          console.error('❌ Change password error:', error);
        }
      });
    } else {
      // Mark all fields as touched để hiển thị error
      Object.values(this.changePasswordForm.controls).forEach(control => {
        control.markAsTouched();
        control.updateValueAndValidity({ onlySelf: true });
      });
    }
  }

  closeModal(): void {
    this.closeEvent.emit();
  }
}
