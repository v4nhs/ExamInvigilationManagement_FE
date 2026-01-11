import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { LecturerService } from '../../services/lecturer.service';
import { DepartmentService } from '../../services/department.service';
import { UserService } from '../../services/user.service';
import { Lecturer, LecturerRequest } from '../../models/lecturer.models';
import { Department } from '../../models/department.models';

interface UserOption {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-lecturer-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lecturer-add.component.html',
  styleUrls: ['./lecturer-add.component.css']
})
export class LecturerAddComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Input() editLecturerId: number | null = null;

  lecturer: any = {
    userId: undefined,
    departmentId: undefined,
    academicTitle: '',
    specialization: ''
  };

  departments: Department[] = [];
  users: UserOption[] = [];
  usedUserIds: Set<number> = new Set(); // Lưu danh sách userId đã được dùng
  loading = false;

  constructor(
    private lecturerService: LecturerService,
    private departmentService: DepartmentService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadUsers();
    this.loadExistingLecturers(); // Load để lấy danh sách userId đã được dùng
    
    if (this.editLecturerId) {
      this.loadLecturer(this.editLecturerId);
    }
  }

  loadDepartments(): void {
    this.departmentService.getAll().subscribe({
      next: (data) => {
        this.departments = data;
        console.log('Departments loaded:', this.departments);
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.notificationService.error('Không thể tải danh sách phòng ban!');
      }
    });
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data: any[]) => {
        this.users = data.map((user: any) => ({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName
        }));
        console.log('Users loaded:', this.users);
      },
      error: (err: any) => {
        console.error('Error loading users:', err);
        this.notificationService.error('Không thể tải danh sách người dùng!');
      }
    });
  }

  loadExistingLecturers(): void {
    this.lecturerService.getAll().subscribe({
      next: (data: any[]) => {
        // Lấy danh sách userId đã được dùng (trừ lecturer đang edit)
        this.usedUserIds = new Set(
          data
            .filter(l => !this.editLecturerId || l.id !== this.editLecturerId)
            .map(l => l.userId)
            .filter(id => id !== undefined && id !== null)
        );
        console.log('Used user IDs:', this.usedUserIds);
      },
      error: (err: any) => {
        console.error('Error loading existing lecturers:', err);
      }
    });
  }

  loadLecturer(id: number): void {
    this.loading = true;
    this.lecturerService.getById(id).subscribe({
      next: (data: any) => {
        this.lecturer = {
          userId: data.userId,
          departmentId: data.departmentId,
          academicTitle: data.academicTitle || '',
          specialization: data.specialization || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          user: data.user
        };
        console.log('Lecturer loaded:', this.lecturer);
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading lecturer:', err);
        this.loading = false;
        this.notificationService.error('Không thể tải dữ liệu giảng viên!');
      }
    });
  }

  save(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    console.log('Saving lecturer with data:', this.lecturer);
    
    const request = this.editLecturerId
      ? this.lecturerService.update(this.editLecturerId, this.lecturer)
      : this.lecturerService.create(this.lecturer);

    request.subscribe({
      next: () => {
        this.notificationService.success(this.editLecturerId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        this.loading = false;
        this.saved.emit();
        this.closeDialog();
      },
      error: (err) => {
        console.error('Error saving lecturer:', err);
        console.error('Error response:', err.error);
        const errorMsg = err.error?.message || 'Lỗi khi lưu dữ liệu!';
        this.notificationService.error(errorMsg);
        this.loading = false;
      }
    });
  }

  validateForm(): boolean {
    // Khi thêm mới, bắt buộc chọn người dùng
    if (!this.editLecturerId && !this.lecturer.userId) {
      this.notificationService.warning('Vui lòng chọn người dùng');
      return false;
    }
    // Check nếu user này đã được dùng làm lecturer
    if (!this.editLecturerId && this.usedUserIds.has(this.lecturer.userId)) {
      this.notificationService.warning('Người dùng này đã được thêm làm giảng viên!');
      return false;
    }
    if (!this.lecturer.departmentId) {
      this.notificationService.warning('Vui lòng chọn khoa');
      return false;
    }
    if (!this.lecturer.academicTitle.trim()) {
      this.notificationService.warning('Vui lòng nhập chức danh');
      return false;
    }
    if (!this.lecturer.specialization.trim()) {
      this.notificationService.warning('Vui lòng nhập chuyên môn');
      return false;
    }
    return true;
  }

  closeDialog(): void {
    this.close.emit();
  }
}
