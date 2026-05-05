import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PerformanceService } from '../../services/performance.service';
import { PerformanceResponse, PerformanceSortOption, getPerformanceRatingTier } from '../../models/performance.model';
import { PerformanceCardComponent } from '../../components/performance-card/performance-card.component';

/**
 * Performance List Component
 * Display all performances in table or card view with filtering and sorting
 */
@Component({
  selector: 'app-performance-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PerformanceCardComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Performance Records</h1>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                View and manage all player performances
              </p>
            </div>
            <a
              routerLink="/app/admin/performances/create"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              + Log Performance
            </a>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <!-- Filters and Controls -->
        <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters & Sorting</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Rating Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Rating
              </label>
              <select
                (change)="updateMinRating($event)"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Ratings</option>
                <option value="5">5.0+</option>
                <option value="6">6.0+ (Satisfactory)</option>
                <option value="7">7.0+ (Good)</option>
                <option value="8">8.0+ (Excellent)</option>
                <option value="9">9.0+ (Outstanding)</option>
              </select>
            </div>

            <!-- Goals Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goals Scored
              </label>
              <select
                (change)="updateGoalsFilter($event)"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any</option>
                <option value="0">0 goals</option>
                <option value="1-5">1-5 goals</option>
                <option value="6-10">6-10 goals</option>
                <option value="11">11+ goals</option>
              </select>
            </div>

            <!-- Sort By -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                (change)="updateSorting($event)"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="rating-desc">Rating High to Low</option>
                <option value="rating-asc">Rating Low to High</option>
                <option value="goals-desc">Most Goals</option>
                <option value="goals-asc">Fewest Goals</option>
                <option value="assists-desc">Most Assists</option>
                <option value="distance-desc">Most Distance</option>
              </select>
            </div>

            <!-- View Toggle -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                View
              </label>
              <div class="flex gap-2">
                <button
                  (click)="viewMode.set('card')"
                  [class.ring-2]="viewMode() === 'card'"
                  class="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 ring-primary transition-colors text-sm font-medium"
                >
                  🎯 Cards
                </button>
                <button
                  (click)="viewMode.set('table')"
                  [class.ring-2]="viewMode() === 'table'"
                  class="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 ring-primary transition-colors text-sm font-medium"
                >
                  📋 Table
                </button>
              </div>
            </div>
          </div>

          <div class="mt-4 flex justify-between items-center">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Showing <span class="font-semibold">{{ filteredPerformances().length }}</span> of <span class="font-semibold">{{ performanceService.getPerformancesSignal()().length }}</span> records
            </p>
            <button
              (click)="clearFilters()"
              class="text-sm px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Card View -->
        @if (viewMode() === 'card') {
          @if (filteredPerformances().length === 0) {
            <div class="text-center py-12">
              <p class="text-gray-600 dark:text-gray-400 mb-4">No performances found</p>
              <a routerLink="/app/admin/performances/create" class="text-primary hover:underline font-medium">
                Log first performance →
              </a>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (perf of filteredPerformances(); track perf.id) {
                <app-performance-card [performance]="perf" />
              }
            </div>
          }
        }

        <!-- Table View -->
        @if (viewMode() === 'table') {
          @if (filteredPerformances().length === 0) {
            <div class="text-center py-12">
              <p class="text-gray-600 dark:text-gray-400 mb-4">No performances found</p>
              <a routerLink="/app/admin/performances/create" class="text-primary hover:underline font-medium">
                Log first performance →
              </a>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-200 dark:border-gray-800">
                    <th class="text-left px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Player ID</th>
                    <th class="text-left px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Match ID</th>
                    <th class="text-center px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Goals</th>
                    <th class="text-center px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Assists</th>
                    <th class="text-center px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Distance</th>
                    <th class="text-center px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Time</th>
                    <th class="text-center px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Rating</th>
                    <th class="text-center px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (perf of filteredPerformances(); track perf.id; let i = $index) {
                    <tr [class.bg-gray-50]="i % 2 === 0" [class.dark:bg-gray-800]="i % 2 === 0" class="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{{ perf.playerId }}</td>
                      <td class="px-4 py-3 text-sm text-gray-900 dark:text-white font-mono">{{ perf.matchId }}</td>
                      <td class="px-4 py-3 text-center text-sm text-gray-900 dark:text-white font-bold">{{ perf.score }}</td>
                      <td class="px-4 py-3 text-center text-sm text-gray-900 dark:text-white font-bold">{{ perf.assists }}</td>
                      <td class="px-4 py-3 text-center text-sm text-gray-900 dark:text-white font-mono">{{ perf.distanceCovered }}km</td>
                      <td class="px-4 py-3 text-center text-sm text-gray-900 dark:text-white font-mono">{{ perf.timePlayed }}'</td>
                      <td class="px-4 py-3 text-center">
                        <span [ngClass]="getRatingColor(perf.rating)" class="text-sm font-bold">
                          {{ perf.rating.toFixed(1) }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-center">
                        <div class="flex gap-2 justify-center">
                          <a
                            [routerLink]="['/app/admin/performances', perf.id]"
                            class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          >
                            View
                          </a>
                          <a
                            [routerLink]="['/app/admin/performances', perf.id, 'edit']"
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
        }
      </div>
    </div>
  `
})
export class PerformanceListComponent implements OnInit {
  performanceService = inject(PerformanceService);

  viewMode = signal<'card' | 'table'>('card');

  filteredPerformances = this.performanceService.filteredPerformances;

  ngOnInit(): void {
    this.loadPerformances();
  }

  loadPerformances(): void {
    this.performanceService.getPerformances().subscribe();
  }

  updateMinRating(event: any): void {
    const value = event.target.value;
    if (value) {
      this.performanceService.setFilters({ minRating: parseFloat(value) });
    } else {
      this.performanceService.clearFilters();
    }
  }

  updateGoalsFilter(event: any): void {
    const value = event.target.value;
    const current = this.performanceService.filters();

    if (value === '0') {
      this.performanceService.setFilters({ ...current, minGoals: 0, maxGoals: 0 });
    } else if (value === '1-5') {
      this.performanceService.setFilters({ ...current, minGoals: 1, maxGoals: 5 });
    } else if (value === '6-10') {
      this.performanceService.setFilters({ ...current, minGoals: 6, maxGoals: 10 });
    } else if (value === '11') {
      this.performanceService.setFilters({ ...current, minGoals: 11 });
    } else {
      const { minGoals, maxGoals, ...rest } = current;
      this.performanceService.setFilters(rest);
    }
  }

  updateSorting(event: any): void {
    const value = event.target.value as PerformanceSortOption;
    this.performanceService.setSortBy(value);
  }

  clearFilters(): void {
    this.performanceService.clearFilters();
  }

  getRatingColor(rating: number): string {
    if (rating >= 8) return 'text-green-600 dark:text-green-400';
    if (rating >= 6) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 5) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }
}
