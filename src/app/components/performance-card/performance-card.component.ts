import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PerformanceResponse, getPerformanceRatingTier, PERFORMANCE_RATING_TIERS } from '../../models/performance.model';

/**
 * Reusable Performance Card Component
 * Displays performance summary with metrics
 */
@Component({
  selector: 'app-performance-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (performance) {
      <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
        <div class="p-6">
          <!-- Header with Rating -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Match #{{ performance.matchId }}
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ performance.createdAt | date: 'MMM d, yyyy' }}
              </p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold" [ngClass]="getRatingColor()">
                {{ performance.rating.toFixed(1) }}
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ getRatingTier()?.label }}
              </p>
            </div>
          </div>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <!-- Goals -->
            <div class="text-center">
              <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">Goals</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ performance.score }}
              </p>
            </div>

            <!-- Assists -->
            <div class="text-center">
              <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">Assists</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ performance.assists }}
              </p>
            </div>

            <!-- Distance -->
            <div class="text-center">
              <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">Distance</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ performance.distanceCovered }}km
              </p>
            </div>

            <!-- Time Played -->
            <div class="text-center">
              <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">Played</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {{ performance.timePlayed }}'
              </p>
            </div>

            <!-- Efficiency -->
            <div class="text-center">
              <p class="text-xs text-gray-600 dark:text-gray-400 font-medium">Efficiency</p>
              <p class="text-2xl font-bold text-primary mt-1">
                {{ getEfficiency().toFixed(1) }}
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <a
              [routerLink]="['/app/admin/performances', performance.id]"
              class="flex-1 text-center px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors font-medium"
            >
              View Details
            </a>
            <a
              [routerLink]="['/app/admin/performances', performance.id, 'edit']"
              class="flex-1 text-center px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Edit
            </a>
          </div>
        </div>
      </div>
    }
  `
})
export class PerformanceCardComponent {
  @Input() performance: PerformanceResponse | null = null;

  getRatingTier() {
    if (!this.performance) return null;
    return getPerformanceRatingTier(this.performance.rating);
  }

  getRatingColor(): string {
    const tier = this.getRatingTier();
    return tier?.color || 'text-gray-500';
  }

  getEfficiency(): number {
    if (!this.performance) return 0;
    const { score, assists, distanceCovered, timePlayed, rating } = this.performance;
    const goalEff = (score / 20) * 10;
    const assistEff = (assists / 15) * 10;
    const staminaEff = (distanceCovered / 50) * 10;
    const timeEff = (timePlayed / 120) * 10;
    return (goalEff * 0.25 + assistEff * 0.20 + staminaEff * 0.20 + timeEff * 0.15 + rating * 0.20) / 10;
  }
}
