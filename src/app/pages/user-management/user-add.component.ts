import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserCreationRequest } from '../../services/user.service'; 
import { RoleService, Role } from '../../services/role.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select'; 
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [FormsModule, CommonModule, NzSelectModule, NzButtonModule, NzInputModule],
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit { // Implement OnInit
  form: UserCreationRequest = {
    username: '',
    password: '',
    firstName: 'User',
    lastName: 'New',
    email: '',
    roleIds: []
  };
  roles: Role[] = [];

  constructor(
    private userService: UserService, 
    private roleService: RoleService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (data) => {
        this.roles = data;
        console.log('Roles loaded for select:', this.roles);
      },
      error: (err) => console.error('Không thể tải danh sách vai trò:', err)
    });
  }

  goBack() {
    this.router.navigate(['/user-management']);
  }

  onSubmit() {
    this.userService.createUser(this.form).subscribe({
      next: () => {
        alert('Thêm người dùng thành công!');
        this.router.navigate(['/user-management']);
      },
      error: (err) => {
        alert('Lỗi: ' + (err.error?.message || 'Không thể thêm người dùng'));
      }
    });
  }
}