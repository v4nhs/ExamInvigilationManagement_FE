import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DepartmentService } from '../../services/department.service';
import { DepartmentRequest } from '../../models/department.models';

@Component({
  selector: 'app-department-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './department-add.component.html',
  styleUrls: ['./department-add.component.css']
})
export class DepartmentAddComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Input() editDepartmentId: number | null = null;

  departmentForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private message: NzMessageService
  ) {
    this.departmentForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit() {
    if (this.editDepartmentId) {
      this.loadDepartmentData(this.editDepartmentId);
    }
  }

  loadDepartmentData(id: number) {
    this.loading = true;
    this.departmentService.getById(id).subscribe({
      next: (data) => {
        this.departmentForm.patchValue({
          name: data.name,
          code: data.code,
          description: data.description
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading department:', err);
        this.message.error('Không thể tải dữ liệu phòng ban!');
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.departmentForm.invalid) return;

    this.loading = true;
    const request: DepartmentRequest = this.departmentForm.value;

    const submitRequest = this.editDepartmentId
      ? this.departmentService.update(this.editDepartmentId, request)
      : this.departmentService.create(request);

    submitRequest.subscribe({
      next: () => {
        this.message.success(this.editDepartmentId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        this.loading = false;
        this.saved.emit();
        this.closeDialog();
      },
      error: (err) => {
        console.error('Error saving department:', err);
        const errorMsg = err.error?.message || 'Lỗi khi lưu dữ liệu!';
        this.message.error(errorMsg);
        this.loading = false;
      }
    });
  }

  closeDialog(): void {
    this.close.emit();
  }
}
