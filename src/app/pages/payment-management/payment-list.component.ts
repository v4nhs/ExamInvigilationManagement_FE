import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaymentService, PaymentResponse, Page } from '../../services/payment.service';
import { NotificationService } from '../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css']
})
export class PaymentListComponent implements OnInit, OnDestroy {
  payments: PaymentResponse[] = [];
  filteredPayments: PaymentResponse[] = [];
  loading = false;
  deleting: number | null = null;
  searchQuery: string = '';
  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortBy: string = 'id';
  sortDirection: string = 'DESC';
  Math = Math;
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  constructor(
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchPaymentsPaginated();
    
    // Setup search with debounce
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0; // Reset to first page on search
      this.fetchPaymentsPaginated();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchSubject$.next(query);
  }

  fetchPaymentsPaginated() {
    this.loading = true;
    this.paymentService.getPaymentsPaginated(
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDirection
    ).subscribe({
      next: (page: Page<PaymentResponse>) => this.handlePageResponse(page),
      error: (err) => this.handleError(err)
    });
  }

  handlePageResponse(page: Page<PaymentResponse>) {
    this.payments = page.content || [];
    this.filteredPayments = this.payments;
    this.totalElements = page.totalElements;
    this.totalPages = page.totalPages;
    this.loading = false;
    
    // Log full payment structure for debugging
    console.log('Full payments:', this.payments);
    if (this.payments.length > 0) {
      console.log('First payment object:', JSON.stringify(this.payments[0], null, 2));
    }
  }

  handleError(err: any) {
    this.loading = false;
    console.error('Lỗi tải danh sách thanh toán:', err);
    this.notificationService.error('Lỗi tải danh sách thanh toán');
  }

  clearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.filteredPayments = this.payments;
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.fetchPaymentsPaginated();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.fetchPaymentsPaginated();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.fetchPaymentsPaginated();
    }
  }

  viewDetails(paymentId: number) {
    this.router.navigate(['/payment', paymentId]);
  }

  deletePayment(id: number) {
    if (!confirm('Bạn có chắc chắn muốn xóa khoản thanh toán này?')) return;

    this.deleting = id;
    this.paymentService.deletePayment(id).subscribe({
      next: () => {
        this.payments = this.payments.filter(p => p.id !== id);
        this.filteredPayments = this.filteredPayments.filter(p => p.id !== id);
        this.deleting = null;
        this.notificationService.success('Xóa khoản thanh toán thành công!');
      },
      error: (err) => {
        this.notificationService.error('Xóa khoản thanh toán thất bại!');
        this.deleting = null;
        console.error(err);
      }
    });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisible);

    if (endPage - startPage < maxVisible) {
      startPage = Math.max(0, endPage - maxVisible);
    }

    for (let i = startPage; i < endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.fetchPaymentsPaginated();
  }

  getStatusBadgeClass(status: string): string {
    if (!status) return 'status-default';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'paid') return 'status-paid';
    if (lowerStatus === 'pending') return 'status-pending';
    if (lowerStatus === 'cancelled') return 'status-cancelled';
    return 'status-default';
  }

  getStatusLabel(status: string): string {
    if (!status) return 'Chưa thanh toán';
    const statusMap: { [key: string]: string } = {
      'PAID': 'Đã thanh toán',
      'PENDING': 'Chờ thanh toán',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  }
}
