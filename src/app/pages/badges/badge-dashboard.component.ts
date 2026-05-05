import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BadgeService } from '../../services/badge.service';
import { BadgeResponse, BADGE_LEVEL_TIERS } from '../../models/badge.model';

/**
 * Badge Management Dashboard
 * Displays statistics and quick access to badge management features
 */
@Component({
  selector: 'app-badge-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Badge Management</h1>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                Manage badges and achievement system
              </p>
            </div>
            <a
              routerLink="/app/admin/badges/create"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              + New Badge
            </a>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <!-- Statistics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Total Badges -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Badges</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {{ badgeService.getBadgesSignal().length }}
                </p>
              </div>
              <div class="text-4xl">🎖️</div>
            </div>
          </div>

          <!-- Level Distribution -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Level Distribution</p>
              <div class="mt-4 space-y-2">
                @for (tier of BADGE_LEVEL_TIERS; track tier.min) {
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-gray-600 dark:text-gray-400">{{ tier.label }}</span>
                    <span class="text-xs font-mono text-gray-900 dark:text-white">
                      {{ getBadgeCountByLevel(tier.min, tier.max) }}
                    </span>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Average Level -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Average Level</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {{ getAverageLevel() | number: '1.1-1' }}
                </p>
              </div>
              <div class="text-4xl">⭐</div>
            </div>
          </div>

          <!-- Total XP Pool -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Total XP Required</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white mt-2 font-mono">
                  {{ getTotalXpRequired() | number }}
                </p>
              </div>
              <div class="text-4xl">⚡</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div class="flex flex-wrap gap-3">
            <a
              routerLink="/app/admin/badges/create"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              ✨ Create Badge
            </a>
            <a
              routerLink="/app/admin/badges"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              📋 View All Badges
            </a>
            <button
              (click)="refreshData()"
              class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <!-- Recent Badges -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Badges</h2>
            <a
              routerLink="/app/admin/badges"
              class="text-primary text-sm font-medium hover:underline"
            >
              View All →
            </a>
          </div>

          @if (getRecentBadges().length === 0) {
            <div class="text-center py-8">
              <p class="text-gray-600 dark:text-gray-400">No badges created yet</p>
              <a
                routerLink="/app/admin/badges/create"
                class="mt-3 inline-block text-primary font-medium hover:underline"
              >
                Create the first badge →
              </a>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (badge of getRecentBadges(); track badge.id) {
                <div class="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div class="flex gap-4">
                    <img
                      [src]="badge.iconUrl"
                      [alt]="badge.name"
                      class="w-12 h-12 rounded object-contain flex-shrink-0"
                      (error)="onImageError($event)"
                    />
                    <div class="flex-1 min-w-0">
                      <h3 class="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {{ badge.name }}
                      </h3>
                      <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Level {{ badge.level }} • {{ badge.requiredXp | number }} XP
                      </p>
                      <div class="mt-2 flex gap-1">
                        <a
                          [routerLink]="['/app/admin/badges', badge.id]"
                          class="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                        >
                          View
                        </a>
                        <a
                          [routerLink]="['/app/admin/badges', badge.id, 'edit']"
                          class="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <!-- Level Tiers Guide -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Badge Level Tiers</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (tier of BADGE_LEVEL_TIERS; track tier.min) {
              <div class="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div class="flex items-start justify-between mb-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">{{ tier.label }}</h3>
                  <span class="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                    {{ tier.min }}-{{ tier.max }}
                  </span>
                </div>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  {{ tier.description }}
                </p>
                <div class="mt-3 flex items-center gap-2">
                  <span class="text-xs text-gray-600 dark:text-gray-400">Recommended for:</span>
                </div>
                <div class="text-sm mt-1">
                  {{ getTierRecommendation(tier.min) }}
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class BadgeDashboardComponent implements OnInit {
  badgeService = inject(BadgeService);

  BADGE_LEVEL_TIERS = BADGE_LEVEL_TIERS;
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.badgeService.getBadges().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(this.badgeService.parseApiError(err));
      }
    });
  }

  refreshData(): void {
    this.badgeService.refreshBadges().subscribe({
      next: () => {
        // Data refreshed
      },
      error: (err) => {
        this.error.set(this.badgeService.parseApiError(err));
      }
    });
  }

  getRecentBadges(): BadgeResponse[] {
    return this.badgeService.getBadgesSignal().slice(0, 6);
  }

  getBadgeCountByLevel(min: number, max: number): number {
    return this.badgeService.getBadgesSignal().filter(b => b.level >= min && b.level <= max).length;
  }

  getAverageLevel(): number {
    const badges = this.badgeService.getBadgesSignal();
    if (badges.length === 0) return 0;
    const sum = badges.reduce((acc, b) => acc + b.level, 0);
    return sum / badges.length;
  }

  getTotalXpRequired(): number {
    return this.badgeService.getBadgesSignal().reduce((acc, b) => acc + b.requiredXp, 0);
  }

  getTierRecommendation(level: number): string {
    if (level <= 2) {
      return 'Sign-ups, First Login, Basic Tasks';
    } else if (level <= 5) {
      return 'Regular Participation, Achievements';
    } else if (level <= 8) {
      return 'Milestones, Expert Tasks';
    } else {
      return 'Master Status, Legendary Deeds';
    }
  }

  onImageError(event: any): void {
    event.target.src = '🎖️';
  }
}
