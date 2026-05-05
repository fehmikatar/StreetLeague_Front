import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PerformanceService } from '../../services/performance.service';
import { CareerStats, getTrendEmoji, PERFORMANCE_RATING_TIERS, PerformanceResponse } from '../../models/performance.model';
import { PerformanceCardComponent } from '../../components/performance-card/performance-card.component';

/**
 * Performance Dashboard Component
 * Overview of performance system with statistics, quick actions, and recent performances
 */
@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PerformanceCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Performance Management</h1>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                Track and analyze player performance metrics
              </p>
            </div>
            <a
              routerLink="/app/admin/performances/create"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              ✨ Log Performance
            </a>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <!-- System Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Performances -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Performances</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {{ performanceService.getPerformancesSignal()().length }}
                </p>
              </div>
              <div class="text-4xl">📊</div>
            </div>
          </div>

          <!-- Excellent Performances (≥8.0) -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Excellent (≥8.0)</p>
                <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {{ getExcellentCount() }}
                </p>
              </div>
              <div class="text-4xl">⭐</div>
            </div>
          </div>

          <!-- Average Rating -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Rating</p>
                <p class="text-3xl font-bold text-primary mt-2">
                  {{ getAverageRating().toFixed(1) }}
                </p>
              </div>
              <div class="text-4xl">📈</div>
            </div>
          </div>

          <!-- Total Goals Scored -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Goals</p>
                <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {{ getTotalGoals() }}
                </p>
              </div>
              <div class="text-4xl">⚽</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div class="flex flex-wrap gap-3">
            <a
              routerLink="/app/admin/performances/create"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              ✨ Log Performance
            </a>
            <a
              routerLink="/app/admin/performances"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              📋 View All Performances
            </a>
            <button
              (click)="refreshData()"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <!-- Recent Performances -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Performances</h2>
            <a
              routerLink="/app/admin/performances"
              class="text-primary text-sm font-medium hover:underline"
            >
              View All →
            </a>
          </div>

          @if (getRecentPerformances().length === 0) {
            <div class="text-center py-8">
              <p class="text-gray-600 dark:text-gray-400">No performances logged yet</p>
              <a
                routerLink="/app/admin/performances/create"
                class="mt-3 inline-block text-primary font-medium hover:underline"
              >
                Log first performance →
              </a>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (perf of getRecentPerformances(); track perf.id) {
                <app-performance-card [performance]="perf" />
              }
            </div>
          }
        </div>

        <!-- Rating Distribution -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Rating Distribution</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (tier of PERFORMANCE_RATING_TIERS; track tier.min) {
              <div [ngClass]="tier.bgColor + ' p-4 rounded-lg border border-gray-200 dark:border-gray-800'">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ tier.label }}</h3>
                  <span class="text-sm font-mono text-gray-600 dark:text-gray-400">
                    {{ tier.min.toFixed(1) }}-{{ tier.max.toFixed(1) }}
                  </span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ tier.description }}
                </p>
                <div class="mt-3">
                  <p class="text-2xl font-bold" [ngClass]="tier.color">
                    {{ getPerformanceCountByRatingTier(tier.min, tier.max) }}
                  </p>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {{ getPerformancePercentageByRatingTier(tier.min, tier.max) }}%
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class PerformanceDashboardComponent implements OnInit {
  performanceService = inject(PerformanceService);
  PERFORMANCE_RATING_TIERS = PERFORMANCE_RATING_TIERS;

  ngOnInit(): void {
    this.loadPerformances();
  }

  loadPerformances(): void {
    this.performanceService.getPerformances().subscribe();
  }

  refreshData(): void {
    this.loadPerformances();
  }

  getRecentPerformances() {
    return this.performanceService.getRecentPerformances(6);
  }

  getExcellentCount(): number {
    return this.performanceService.getPerformancesSignal()().filter((p: PerformanceResponse) => p.rating >= 8.0).length;
  }

  getTotalGoals(): number {
    return this.performanceService.getPerformancesSignal()().reduce((sum: number, p: PerformanceResponse) => sum + p.score, 0);
  }

  getAverageRating(): number {
    const perfs = this.performanceService.getPerformancesSignal()();
    if (perfs.length === 0) return 0;
    return perfs.reduce((sum: number, p: PerformanceResponse) => sum + p.rating, 0) / perfs.length;
  }

  getPerformanceCountByRatingTier(min: number, max: number): number {
    return this.performanceService.getPerformancesSignal()()
      .filter((p: PerformanceResponse) => p.rating >= min && p.rating <= max).length;
  }

  getPerformancePercentageByRatingTier(min: number, max: number): number {
    const count = this.getPerformanceCountByRatingTier(min, max);
    const total = this.performanceService.getPerformancesSignal()().length;
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }
}
