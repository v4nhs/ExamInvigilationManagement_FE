import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PaymentService, PaymentResponse, Page } from '../../services/payment.service';

@Component({
  selector: 'app-payouts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.css']
})
export class PayoutsComponent implements OnInit {
  // Statistics data
  totalRevenue = 0;
  totalPayments = 0;
  paidAmount = 0;
  pendingAmount = 0;
  cancelledAmount = 0;
  
  // Chart data
  statusData: Array<{ name: string; value: number; amount: number; percentage: number }> = [];
  
  loading = true;
  error: string | null = null;

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    // Load all payments with pagination (get all by using large page size)
    this.paymentService.getPaymentsPaginated(0, 1000, 'id', 'DESC').subscribe({
      next: (page: Page<PaymentResponse>) => {
        const payments = page.content || [];
        this.processPaymentStatistics(payments);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading payments:', err);
        this.error = 'Lỗi tải dữ liệu thanh toán';
        this.loading = false;
      }
    });
  }

  processPaymentStatistics(payments: PaymentResponse[]): void {
    this.totalPayments = payments.length;
    this.totalRevenue = 0;
    const statusCounts: { [key: string]: { count: number; amount: number } } = {};

    // Process each payment
    payments.forEach((payment: any) => {
      const amount = payment.totalAmount || 0;
      this.totalRevenue += amount;

      const status = payment.status || 'CHƯA_THANH_TOÁN';
      const statusKey = status.toUpperCase();

      if (!statusCounts[statusKey]) {
        statusCounts[statusKey] = { count: 0, amount: 0 };
      }
      statusCounts[statusKey].count++;
      statusCounts[statusKey].amount += amount;

      // Track by status
      if (statusKey === 'PAID') {
        this.paidAmount += amount;
      } else if (statusKey === 'PENDING') {
        this.pendingAmount += amount;
      } else if (statusKey === 'CANCELLED') {
        this.cancelledAmount += amount;
      }
    });

    // Generate status chart data
    this.statusData = Object.entries(statusCounts)
      .map(([status, data]) => {
        const displayStatus = this.getStatusLabel(status);
        return {
          name: displayStatus,
          value: data.count,
          amount: data.amount,
          percentage: this.totalRevenue > 0 ? Math.round((data.amount / this.totalRevenue) * 100) : 0
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PAID': 'Đã thanh toán',
      'PENDING': 'Chờ thanh toán',
      'CANCELLED': 'Đã hủy',
      'CHƯA_THANH_TOÁN': 'Chưa thanh toán'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'PAID': '#52c41a',
      'PENDING': '#faad14',
      'CANCELLED': '#ff4d4f',
      'CHƯA_THANH_TOÁN': '#d9d9d9'
    };
    return colorMap[status] || '#1890ff';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }
}
