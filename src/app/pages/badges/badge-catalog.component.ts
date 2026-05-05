import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BadgeService } from '../../services/badge.service';
import { BadgeResponse, BadgeCatalogFilters, BADGE_LEVEL_TIERS } from '../../models/badge.model';

/**
 * Badge Catalog Page
 * Displays all badges in grid/table format for admin users
 * Includes sorting, filtering, and search functionality
 */
@Component({
  selector: 'app-badge-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Badge Catalog</h1>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                Manage and view all available badges for your platform
              </p>
            </div>
            <a
              routerLink="/admin/badges/create"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              + Create Badge
            </a>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <!-- Filters and Search Bar -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Search -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Search by name or description..."
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <!-- Level Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level Range
              </label>
              <select
                [(ngModel)]="selectedLevelRange"
                (ngModelChange)="onLevelRangeChange($event)"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Levels</option>
                <option value="0-2">Introductory (0-2)</option>
                <option value="3-5">Intermediate (3-5)</option>
                <option value="6-8">Advanced (6-8)</option>
                <option value="9-10">Master (9-10)</option>
              </select>
            </div>

            <!-- Sort By -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                [(ngModel)]="sortBy"
                (ngModelChange)="onSortChange($event)"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="name">Name (A-Z)</option>
                <option value="level">Level (Low-High)</option>
                <option value="xp">XP Required (Low-High)</option>
                <option value="createdAt">Recently Created</option>
              </select>
            </div>

            <!-- View Mode -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                View Mode
              </label>
              <div class="flex gap-2">
                <button
                  (click)="viewMode = 'grid'"
                  [class.bg-primary]="viewMode === 'grid'"
                  [class.text-white]="viewMode === 'grid'"
                  [class.bg-gray-200]="viewMode !== 'grid'"
                  [class.text-gray-700]="viewMode !== 'grid'"
                  class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ⊞ Grid
                </button>
                <button
                  (click)="viewMode = 'table'"
                  [class.bg-primary]="viewMode === 'table'"
                  [class.text-white]="viewMode === 'table'"
                  [class.bg-gray-200]="viewMode !== 'table'"
                  [class.text-gray-700]="viewMode !== 'table'"
                  class="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ≡ List
                </button>
              </div>
            </div>
          </div>

          <!-- Refresh Button -->
          <div class="mt-4">
            <button
              (click)="refreshBadges()"
              [disabled]="isLoading()"
              class="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <!-- Results Info -->
        <div class="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing <strong>{{ filteredBadges().length }}</strong> of <strong>{{ badgeService.getBadgesSignal().length }}</strong> badges
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="space-y-4">
            @for (item of [1, 2, 3]; track item) {
              <div class="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
            }
          </div>
        }

        <!-- Error State -->
        @if (error()) {
          <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200">
            {{ error() }}
            <button (click)="refreshBadges()" class="ml-2 underline font-semibold">
              Retry
            </button>
          </div>
        }

        <!-- Grid View -->
        @if (viewMode === 'grid' && filteredBadges().length > 0 && !isLoading()) {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            @for (badge of filteredBadges(); track badge.id) {
              <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
                <!-- Badge Image -->
                <div class="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden group">
                  <img
                    [src]="badge.iconUrl"
                    [alt]="badge.name"
                    class="w-24 h-24 object-contain group-hover:scale-110 transition-transform duration-300"
                    (error)="onImageError($event)"
                  />
                </div>

                <!-- Badge Info -->
                <div class="p-4">
                  <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ badge.name }}</h3>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    ★ Level {{ badge.level }}/10
                  </p>
                  @if (badge.description) {
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                      {{ badge.description }}
                    </p>
                  }
                  <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                      {{ badge.requiredXp | number }} XP
                    </p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="px-4 pb-4 flex gap-2">
                  <a
                    [routerLink]="['/admin/badges', badge.id]"
                    class="flex-1 px-3 py-2 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors text-center"
                  >
                    View
                  </a>
                  <a
                    [routerLink]="['/admin/badges', badge.id, 'edit']"
                    class="flex-1 px-3 py-2 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center"
                  >
                    Edit
                  </a>
                </div>
              </div>
            }
          </div>
        }

        <!-- Table View -->
        @if (viewMode === 'table' && filteredBadges().length > 0 && !isLoading()) {
          <div class="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Icon</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Name</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Level</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">XP Required</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Description</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                @for (badge of filteredBadges(); track badge.id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td class="px-4 py-3">
                      <img
                        [src]="badge.iconUrl"
                        [alt]="badge.name"
                        class="w-8 h-8 rounded object-contain"
                        (error)="onImageError($event)"
                      />
                    </td>
                    <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {{ badge.name }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {{ badge.level }}/10
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {{ badge.requiredXp | number }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                      {{ badge.description || '-' }}
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="flex gap-2 justify-end">
                        <a
                          [routerLink]="['/admin/badges', badge.id]"
                          class="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                        >
                          View
                        </a>
                        <a
                          [routerLink]="['/admin/badges', badge.id, 'edit']"
                          class="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Edit
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Empty State -->
        @if (filteredBadges().length === 0 && !isLoading()) {
          <div class="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div class="text-4xl mb-4">🎖️</div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No badges found
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              @if (searchQuery || selectedLevelRange) {
                Try adjusting your filters or create a new badge to get started.
              } @else {
                Create your first badge to get started.
              }
            </p>
            <a
              routerLink="/admin/badges/create"
              class="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Create First Badge
            </a>
          </div>
        }
      </div>
    </div>
  `
})
export class BadgeCatalogComponent implements OnInit {
  badgeService = inject(BadgeService);

  searchQuery = '';
  selectedLevelRange = '';
  sortBy: 'name' | 'level' | 'xp' | 'createdAt' = 'name';
  viewMode: 'grid' | 'table' = 'grid';

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  filteredBadges = signal<BadgeResponse[]>([]);

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.badgeService.getBadges().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.updateFilteredBadges();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(this.badgeService.parseApiError(err));
      }
    });
  }

  refreshBadges(): void {
    this.badgeService.refreshBadges().subscribe({
      next: () => {
        this.updateFilteredBadges();
      },
      error: (err) => {
        this.error.set(this.badgeService.parseApiError(err));
      }
    });
  }

  onSearchChange(query: string): void {
    this.badgeService.setFilters({ searchQuery: query });
    this.updateFilteredBadges();
  }

  onLevelRangeChange(range: string): void {
    const filters: any = {};
    if (range) {
      const [min, max] = range.split('-').map(Number);
      filters.minLevel = min;
      filters.maxLevel = max;
    } else {
      filters.minLevel = undefined;
      filters.maxLevel = undefined;
    }
    this.badgeService.setFilters(filters);
    this.updateFilteredBadges();
  }

  onSortChange(sort: string): void {
    this.badgeService.setFilters({
      sortBy: sort as any,
      sortOrder: 'asc'
    });
    this.updateFilteredBadges();
  }

  private updateFilteredBadges(): void {
    this.filteredBadges.set(this.badgeService.getBadgesSignal());
  }

  onImageError(event: any): void {
    event.target.src = '🎖️';
  }
}
