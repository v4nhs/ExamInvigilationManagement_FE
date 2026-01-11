import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface PaymentDetailResponse {
  examScheduleId: number;
  examType: string;
  studentCount: number;
  unitPrice: number;
  amount: number;
}

export interface PaymentResponse {
  id: number;
  lecturerName: string;
  totalAmount: number;
  status: string;
}

export interface SalaryResponse {
  lecturerId: number;
  lecturerName: string;
  totalAmount: number;
  details: PaymentDetailResponse[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  getPaymentsPaginated(
    page: number,
    size: number,
    sort: string = 'id',
    direction: string = 'DESC'
  ): Observable<Page<PaymentResponse>> {
    // Backend now supports server-side pagination
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('direction', direction);

    return this.http.get<any>(`${this.apiUrl}`, { params }).pipe(
      map((response: any) => {
        console.log('Payment Response:', response);
        
        // Check if response is wrapped in ApiResponse
        let pageData = response.result || response;
        
        // If it's already a Spring Data Page object (has 'content' property)
        if (pageData.content && Array.isArray(pageData.content)) {
          return {
            content: pageData.content,
            totalElements: pageData.totalElements || 0,
            totalPages: pageData.totalPages || 0,
            currentPage: pageData.number || page,
            pageSize: pageData.size || size
          };
        }

        // Fallback: if response is an array, do client-side pagination
        const payments: PaymentResponse[] = Array.isArray(pageData) ? pageData : [];
        
        if (payments.length === 0) {
          console.warn('No payments found or invalid response format');
          return {
            content: [],
            totalElements: 0,
            totalPages: 0,
            currentPage: page,
            pageSize: size
          };
        }

        const totalElements = payments.length;
        const totalPages = Math.ceil(totalElements / size);
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const content = payments.slice(startIndex, endIndex);

        return {
          content,
          totalElements,
          totalPages,
          currentPage: page,
          pageSize: size
        };
      }),
      catchError((error: any) => {
        console.error('Error fetching payments:', error);
        return throwError(() => error);
      })
    );
  }

  getPaymentById(id: number): Observable<PaymentResponse> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response: any) => response.result || response)
    );
  }

  getSalaryByLecturer(lecturerId: number): Observable<SalaryResponse> {
    // Backend endpoint là /api/payments/lecturers/{lecturerId}
    return this.http.get<any>(`${this.apiUrl}/lecturers/${lecturerId}`).pipe(
      map((response: any) => response.result || response)
    );
  }

  getAllPayments(): Observable<PaymentResponse[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map((response: any) => response.result || response)
    );
  }

  deletePayment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
