import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LecturerService } from '../../services/lecturer.service';
import { LecturerAddComponent } from './lecturer-add.component';
import { Lecturer } from '../../models/lecturer.models';

@Component({
  selector: 'app-lecturer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LecturerAddComponent],
  templateUrl: './lecturer-list.component.html',
  styleUrls: ['./lecturer-list.component.css']
})
export class LecturerListComponent implements OnInit {
  lecturers: Lecturer[] = [];
  loading = false;
  deleting: number | null = null;
  showAddForm = false;
  editingLecturerId: number | null = null;

  constructor(
    private lecturerService: LecturerService,
    private message: NzMessageService
  ) {}

  ngOnInit() {
    this.fetchLecturers();
  }

  fetchLecturers() {
    this.loading = true;
    this.lecturerService.getAll().subscribe({
      next: (data) => {
        this.lecturers = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openAddForm() {
    this.editingLecturerId = null;
    this.showAddForm = true;
  }

  closeAddForm() {
    this.showAddForm = false;
    this.editingLecturerId = null;
  }

  onLecturerSaved() {
    this.closeAddForm();
    this.fetchLecturers();
  }

  deleteLecturer(id: number) {
    if (!confirm('Bạn có chắc chắn muốn xóa giảng viên này?')) return;

    this.deleting = id;
    this.lecturerService.delete(id).subscribe({
      next: () => {
        this.lecturers = this.lecturers.filter(l => l.id !== id);
        this.deleting = null;
        this.message.success('Xóa giảng viên thành công!');
      },
      error: (err) => {
        this.message.error('Xóa giảng viên thất bại!');
        this.deleting = null;
        console.error(err);
      }
    });
  }
}
