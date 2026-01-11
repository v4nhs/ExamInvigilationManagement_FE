import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PaymentService, SalaryResponse, PaymentDetailResponse } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-lecturer-salary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lecturer-salary.component.html',
  styleUrls: ['./lecturer-salary.component.css']
})
export class LecturerSalaryComponent implements OnInit {
  salary: SalaryResponse | null = null;
  loading = false;
  lecturerId: number | null = null;

  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.lecturerId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.lecturerId) {
      this.fetchSalary();
    }
  }

  fetchSalary() {
    if (!this.lecturerId) return;

    this.loading = true;
    this.paymentService.getSalaryByLecturer(this.lecturerId).subscribe({
      next: (data) => {
        this.salary = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Lỗi tải thông tin lương:', err);
        this.notificationService.error('Lỗi tải thông tin lương');
        this.loading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/payment']);
  }

  getExamTypeLabel(examType: string): string {
    const typeMap: { [key: string]: string } = {
      'WRITTEN': 'Thi viết',
      'OTHER': 'Hình thức khác'
    };
    return typeMap[examType] || examType;
  }

  calculateTotalDetailAmount(): number {
    if (!this.salary || !this.salary.details) return 0;
    return this.salary.details.reduce((sum, detail) => sum + detail.amount, 0);
  }
}
