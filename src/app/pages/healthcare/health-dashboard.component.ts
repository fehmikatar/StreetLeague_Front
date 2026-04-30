import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, Activity, Heart, Calendar, Utensils, TrendingUp, Bell, ClipboardList, ChevronRight } from 'lucide-angular';

@Component({
    selector: 'app-health-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    template: `
    <div class="p-6 space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Health Dashboard</h1>
        <p class="text-muted-foreground">Track your health status and sports performance</p>
      </div>

      <!-- Health Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div *ngFor="let stat of healthStats" class="bg-card rounded-xl p-4 border border-border">
          <div class="flex items-center gap-2 mb-2">
            <lucide-icon [name]="stat.icon" [size]="18" class="text-primary"></lucide-icon>
            <span class="text-xs text-muted-foreground">{{stat.label}}</span>
          </div>
          <p class="text-2xl font-bold text-foreground">{{stat.value}}</p>
          <p class="text-xs" [ngClass]="stat.trend > 0 ? 'text-green-500' : 'text-red-500'">
            {{stat.trend > 0 ? '↑' : '↓'}} {{stat.trendLabel}}
          </p>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a *ngFor="let item of navItems" [routerLink]="item.path"
           class="flex items-center justify-between bg-card hover:bg-muted p-4 rounded-xl border border-border transition-colors cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary/10 rounded-lg">
              <lucide-icon [name]="item.icon" [size]="20" class="text-primary"></lucide-icon>
            </div>
            <div>
              <p class="font-semibold text-foreground">{{item.title}}</p>
              <p class="text-sm text-muted-foreground">{{item.desc}}</p>
            </div>
          </div>
          <lucide-icon [name]="chevronRight" [size]="18" class="text-muted-foreground"></lucide-icon>
        </a>
      </div>
    </div>
  `
})
export class HealthDashboardComponent {
    readonly chevronRight = ChevronRight;

    healthStats = [
        { icon: Heart, label: 'Heart Rate', value: '72 bpm', trend: 1, trendLabel: '3% vs yesterday' },
        { icon: Activity, label: 'Calories Burned', value: '2,340', trend: 1, trendLabel: '8% vs avg.' },
        { icon: TrendingUp, label: 'Fitness Level', value: '83%', trend: 1, trendLabel: '5% this month' },
        { icon: ClipboardList, label: 'Goals', value: '4/6', trend: -1, trendLabel: '2 remaining' },
    ];

    navItems = [
        { path: '/app/healthcare/profile', icon: Heart, title: 'Health Profile', desc: 'Medical information' },
        { path: '/app/healthcare/records', icon: ClipboardList, title: 'Medical Records', desc: 'Health history' },
        { path: '/app/healthcare/appointments', icon: Calendar, title: 'Appointments', desc: 'Upcoming consultations' },
        { path: '/app/healthcare/diet', icon: Utensils, title: 'Diet Plans', desc: 'Nutritional plans' },
        { path: '/app/healthcare/trends', icon: TrendingUp, title: 'Trends', desc: 'Health evolution' },
        { path: '/app/healthcare/alerts', icon: Bell, title: 'Alerts', desc: 'Health notifications' },
    ];
}
