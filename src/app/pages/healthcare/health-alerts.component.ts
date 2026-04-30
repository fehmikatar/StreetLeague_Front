import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Bell, AlertTriangle, Info, CheckCircle, X, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-health-alerts',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="p-6 space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <a routerLink="/app/healthcare" class="p-2 bg-card border border-border rounded-xl hover:bg-muted transition-all">
          <lucide-icon [name]="arrowLeftIcon" [size]="18"></lucide-icon>
        </a>
        <span class="text-sm text-muted-foreground">Health</span>
      </div>
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-foreground">Health Alerts</h1>
          <p class="text-muted-foreground">Notifications and alerts regarding your health</p>
        </div>
        <span class="bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
          {{alerts.length}} alerts
        </span>
      </div>

      <!-- Alert categories -->
      <div class="grid grid-cols-3 gap-3">
        <div *ngFor="let cat of categories" class="bg-card rounded-xl border border-border p-4 text-center">
          <p class="text-2xl font-bold" [ngClass]="cat.color">{{cat.count}}</p>
          <p class="text-xs text-muted-foreground mt-1">{{cat.label}}</p>
        </div>
      </div>

      <!-- Alerts list -->
      <div class="space-y-3">
        <div *ngFor="let alert of alerts" class="bg-card rounded-xl border p-5 flex items-start gap-4"
          [ngClass]="alert.type === 'warning' ? 'border-yellow-200' : alert.type === 'danger' ? 'border-red-200' : 'border-blue-200'">
          <div class="p-2 rounded-lg" [ngClass]="alert.type === 'warning' ? 'bg-yellow-50' : alert.type === 'danger' ? 'bg-red-50' : 'bg-blue-50'">
            <lucide-icon [name]="alert.type === 'info' ? infoIcon : alertIcon" [size]="20"
              [ngClass]="alert.type === 'warning' ? 'text-yellow-500' : alert.type === 'danger' ? 'text-red-500' : 'text-blue-500'">
            </lucide-icon>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-foreground">{{alert.title}}</h3>
            <p class="text-sm text-muted-foreground mt-1">{{alert.message}}</p>
            <p class="text-xs text-muted-foreground mt-2">{{alert.time}}</p>
          </div>
          <button (click)="dismissAlert(alert)" class="p-1 hover:bg-muted rounded transition-colors" title="Dismiss">
            <lucide-icon [name]="closeIcon" [size]="14" class="text-muted-foreground"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `
})
export class HealthAlertsComponent {
  readonly alertIcon = AlertTriangle;
  readonly infoIcon = Info;
  readonly closeIcon = X;
  readonly checkIcon = CheckCircle;
  readonly arrowLeftIcon = ArrowLeft;

  dismissAlert(alert: any) {
    this.alerts = this.alerts.filter(a => a !== alert);
  }

  categories = [
    { label: 'Urgent', count: 1, color: 'text-red-500' },
    { label: 'Attention', count: 2, color: 'text-yellow-500' },
    { label: 'Information', count: 4, color: 'text-blue-500' },
  ];

  alerts = [
    { type: 'danger', title: 'Hypertension detected', message: 'Your blood pressure is high (145/92). Consult your doctor soon.', time: '2 hours ago' },
    { type: 'warning', title: 'Vitamin D Deficiency', message: 'Your Vitamin D level is below normal. Consider supplementation.', time: '1 day ago' },
    { type: 'warning', title: 'Appointment to confirm', message: 'Your appointment on March 10 with Dr. Moreau needs confirmation before tomorrow.', time: '2 days ago' },
    { type: 'info', title: 'Annual check-up recommended', message: 'It\'s time to schedule your annual health check-up.', time: '3 days ago' },
    { type: 'info', title: 'Hydration goal reached', message: 'Congratulations! You reached your hydration goal 5 days in a row.', time: '4 days ago' },
  ];
}
