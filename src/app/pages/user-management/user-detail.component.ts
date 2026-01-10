import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../services/user.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Chi tiết người dùng</h2>
    <div *ngIf="user">
      <p><b>Tên đăng nhập:</b> {{ user.username }}</p>
      <p><b>Email:</b> {{ user.email }}</p>
      
      <p><b>Vai trò:</b> 
        <span *ngFor="let role of user.roles; let last = last">
          {{ role.name }}<span *ngIf="!last">, </span>
        </span>
        <span *ngIf="!user.roles || user.roles.length === 0">Chưa có vai trò</span>
      </p>

      <button (click)="goEdit()">Sửa</button>
      <button (click)="goBack()">Quay lại</button>
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private roleService: RoleService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userService.getUserById(id).subscribe(u => this.user = u);
    }
  }

  goEdit() {
    if (this.user) {
      this.router.navigate([`/user-management/${this.user.id}/edit`]); // Đảm bảo đường dẫn đúng với router config
    }
  }

  goBack() {
    this.router.navigate(['/user-management']);
  }
}