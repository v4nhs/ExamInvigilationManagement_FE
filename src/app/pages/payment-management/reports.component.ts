import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentResponse, Page } from '../../services/payment.service';
import { LecturerService } from '../../services/lecturer.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  // Report data
  allPayments: PaymentResponse[] = [];
  filteredPayments: PaymentResponse[] = [];
  topLecturers: Array<{ name: string; amount: number; count: number }> = [];
  lecturerMap: Map<number, string> = new Map();
  
  // Statistics
  totalRevenue = 0;
  averagePayment = 0;
  maxPayment = 0;
  minPayment = 0;
  
  // Filters
  searchQuery = '';
  statusFilter = 'ALL';
  sortBy = 'amount'; // 'amount', 'lecturer', 'status'
  sortDirection = 'DESC'; // 'ASC', 'DESC'
  
  // UI States
  loading = true;
  error: string | null = null;
  displayMode = 'top-lecturers'; // 'top-lecturers', 'detailed'

  constructor(
    private paymentService: PaymentService,
    private lecturerService: LecturerService
  ) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  loadReportData(): void {
    this.loading = true;
    this.error = null;

    // Load both payments and lecturers in parallel
    forkJoin({
      payments: this.paymentService.getPaymentsPaginated(0, 1000, 'id', 'DESC'),
      lecturers: this.lecturerService.getAll()
    }).subscribe({
      next: (result: any) => {
        this.allPayments = result.payments.content || [];
        
        // Build lecturer map for quick lookup
        const lecturers = Array.isArray(result.lecturers) ? result.lecturers : [];
        lecturers.forEach((lecturer: any) => {
          if (lecturer.id) {
            const name = this.formatLecturerNameFromLecturer(lecturer);
            this.lecturerMap.set(lecturer.id, name);
          }
        });
        
        this.processReportData();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading report data:', err);
        this.error = 'Lỗi tải dữ liệu báo cáo';
        this.loading = false;
      }
    });
  }

  formatLecturerNameFromLecturer(lecturer: any): string {
    if (lecturer.firstName && lecturer.lastName) {
      return (lecturer.firstName + ' ' + lecturer.lastName).trim();
    }
    if (lecturer.firstName) return lecturer.firstName;
    if (lecturer.lastName) return lecturer.lastName;
    if (lecturer.name) return lecturer.name;
    return 'Unknown';
  }

  processReportData(): void {
    // Calculate statistics
    this.totalRevenue = this.allPayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    
    if (this.allPayments.length > 0) {
      this.averagePayment = Math.round(this.totalRevenue / this.allPayments.length);
      const amounts = this.allPayments.map(p => p.totalAmount || 0);
      this.maxPayment = Math.max(...amounts);
      this.minPayment = Math.min(...amounts);
    }

    // Group by lecturer
    const lecturerMap: { [key: string]: { amount: number; count: number } } = {};
    this.allPayments.forEach(payment => {
      const name = this.extractLecturerName(payment);
      if (!lecturerMap[name]) {
        lecturerMap[name] = { amount: 0, count: 0 };
      }
      lecturerMap[name].amount += payment.totalAmount || 0;
      lecturerMap[name].count++;
    });

    // Convert to array and sort
    this.topLecturers = Object.entries(lecturerMap)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // Top 10 lecturers

    this.applyFilters();
  }

  extractLecturerName(payment: any): string {
    // Try multiple property names to find lecturer name
    if (payment.lecturerName && payment.lecturerName !== 'Unknown') {
      return payment.lecturerName;
    }
    if (payment.lecturer && payment.lecturer.name) {
      return payment.lecturer.name;
    }
    if (payment.lecturer && payment.lecturer.firstName) {
      const firstName = payment.lecturer.firstName || '';
      const lastName = payment.lecturer.lastName || '';
      return (firstName + ' ' + lastName).trim();
    }
    if (payment.examSchedule && payment.examSchedule.lecturerName) {
      return payment.examSchedule.lecturerName;
    }
    return 'Unknown';
  }

  applyFilters(): void {
    let filtered = [...this.allPayments];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        this.extractLecturerName(p).toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(p => (p.status || 'CHƯA_THANH_TOÁN').toUpperCase() === this.statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = 0;
      let bValue: any = 0;

      if (this.sortBy === 'amount') {
        aValue = a.totalAmount || 0;
        bValue = b.totalAmount || 0;
      } else if (this.sortBy === 'lecturer') {
        aValue = this.extractLecturerName(a);
        bValue = this.extractLecturerName(b);
      } else if (this.sortBy === 'status') {
        aValue = a.status || '';
        bValue = b.status || '';
      }

      if (this.sortDirection === 'DESC') {
        return typeof aValue === 'string' ? bValue.localeCompare(aValue) : bValue - aValue;
      } else {
        return typeof aValue === 'string' ? aValue.localeCompare(bValue) : aValue - bValue;
      }
    });

    this.filteredPayments = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  changeSortBy(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'DESC' ? 'ASC' : 'DESC';
    } else {
      this.sortBy = field;
      this.sortDirection = 'DESC';
    }
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.sortBy = 'amount';
    this.sortDirection = 'DESC';
    this.applyFilters();
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

  exportToCSV(): void {
    const headers = ['Mã Khoản', 'Giảng viên', 'Số tiền', 'Trạng thái'];
    const rows = this.filteredPayments.map(p => [
      p.id,
      this.extractLecturerName(p),
      p.totalAmount || 0,
      this.getStatusLabel(p.status || 'CHƯA_THANH_TOÁN')
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Add BOM for UTF-8 encoding to fix Vietnamese characters
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}
