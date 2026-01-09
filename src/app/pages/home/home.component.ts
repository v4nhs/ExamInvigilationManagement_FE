import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  currentUser$ = this.authService.currentUser$;

  constructor(
    private authService: AuthService,
    public router: Router // đổi từ private sang public
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
