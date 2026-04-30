import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, TrendingUp, TrendingDown, Heart, Activity, Zap, ArrowLeft } from 'lucide-angular';

@Component({
  selector: 'app-health-trends',
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
      <div>
        <h1 class="text-2xl font-bold text-foreground">Health Trends</h1>
        <p class="text-muted-foreground">Evolution of your health indicators over time</p>
      </div>

      <!-- Period selector -->
      <div class="flex gap-2">
        <button *ngFor="let p of periods" (click)="selectedPeriod = p"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          [ngClass]="selectedPeriod === p ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border hover:bg-muted'">
          {{p}}
        </button>
      </div>

      <!-- Trend Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div *ngFor="let trend of trends" class="bg-card rounded-xl border border-border p-5">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <lucide-icon [name]="trend.icon" [size]="20" class="text-primary"></lucide-icon>
              <span class="font-semibold text-foreground">{{trend.label}}</span>
            </div>
            <div class="flex items-center gap-1" [ngClass]="trend.positive ? 'text-green-500' : 'text-red-500'">
              <lucide-icon [name]="trend.positive ? trendUpIcon : trendDownIcon" [size]="16"></lucide-icon>
              <span class="text-sm font-medium">{{trend.change}}</span>
            </div>
          </div>
          <div class="flex items-baseline gap-2 mb-4">
            <span class="text-3xl font-bold text-foreground">{{trend.current}}</span>
            <span class="text-muted-foreground text-sm">{{trend.unit}}</span>
          </div>
          <!-- Simple bar chart visualization -->
          <div class="flex items-end gap-1 h-16">
            <div *ngFor="let bar of trend.data" class="flex-1 rounded-sm bg-primary/20 hover:bg-primary/40 transition-colors"
              [style.height.%]="(bar / getMax(trend.data)) * 100">
            </div>
          </div>
          <div class="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{{getWeekLabels()[0]}}</span>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HealthTrendsComponent {
  selectedPeriod = '7D';
  periods = ['7D', '1M', '3M', '6M', '1Y'];
  readonly trendUpIcon = TrendingUp;
  readonly trendDownIcon = TrendingDown;
  readonly arrowLeftIcon = ArrowLeft;

  trends = [
    { label: 'Heart Rate', icon: Heart, current: '72', unit: 'bpm', change: '-3%', positive: true, data: [78, 75, 74, 76, 73, 72, 72] },
    { label: 'Fitness Level', icon: Activity, current: '83', unit: '%', change: '+5%', positive: true, data: [72, 74, 75, 77, 80, 82, 83] },
    { label: 'Energy', icon: Zap, current: '76', unit: '/100', change: '+8%', positive: true, data: [65, 67, 70, 71, 73, 75, 76] },
    { label: 'Weight', icon: TrendingDown, current: '75.2', unit: 'kg', change: '-0.8kg', positive: true, data: [76.0, 75.8, 75.6, 75.5, 75.4, 75.3, 75.2] },
  ];

  getMax(data: number[]) { return Math.max(...data); }
  getWeekLabels() { return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; }
}
