import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/core/dashboard.service';
import { DashboardData } from 'src/app/core/dashboard.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  data: DashboardData | null = null;
  cachedAt: string | null = null;
  loading = true;
  errorMessage = '';

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (result) => {
        this.data = result.data;
        this.cachedAt = result.cachedAt;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load dashboard data.';
        this.loading = false;
      }
    });
  }

}
