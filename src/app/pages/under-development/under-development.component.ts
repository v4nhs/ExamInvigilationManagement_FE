import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-under-development',
  standalone: true,
  imports: [CommonModule, RouterModule, NzButtonModule, NzIconModule],
  templateUrl: './under-development.component.html',
  styleUrls: ['./under-development.component.css']
})
export class UnderDevelopmentComponent implements OnInit {
  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.info('🚀 Tính năng này đang được phát triển!');
  }

  goBack(): void {
    window.history.back();
  }
}
