import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PerformanceService } from '../../services/performance.service';
import { PerformanceResponse, getPerformanceRatingTier } from '../../models/performance.model';

/**
 * Performance Detail Component
 * Display full performance record with edit/delete options
 */
@Component({
  selector: 'app-performance-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div class="flex items-center gap-4">
            <a routerLink="/app/admin/performances" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ← Back
            </a>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Performance Record</h1>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        @if (isLoading()) {
          <div class="space-y-4">
            <div class="h-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            <div class="h-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        }

        @if (!isLoading() && performance()) {
          <div class="space-y-6">
            <!-- Performance Overview Card -->
            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                <!-- Left: IDs and Date -->
                <div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 font-medium mb-4">Record Information</p>
                  <div class="space-y-3">
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-500">Performance ID</p>
                      <p class="text-lg font-mono font-bold text-gray-900 dark:text-white">#{{ performance()!.id }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-500">Player ID</p>
                      <p class="text-lg font-mono font-bold text-gray-900 dark:text-white">{{ performance()!.playerId }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-500">Match ID</p>
                      <p class="text-lg font-mono font-bold text-gray-900 dark:text-white">{{ performance()!.matchId }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500 dark:text-gray-500">Date Recorded</p>
                      <p class="text-lg font-bold text-gray-900 dark:text-white">
                        {{ performance()!.createdAt | date: 'MMM d, yyyy · h:mm a' }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Right: Rating Display -->
                <div class="text-center">
                  <p class="text-sm text-gray-600 dark:text-gray-400 font-medium mb-4">Overall Rating</p>
                  <div class="mb-4">
                    <div class="text-6xl font-bold mb-2" [ngClass]="getRatingColor()">
                      {{ performance()!.rating.toFixed(1) }}
                    </div>
                    <p class="text-xl font-semibold text-gray-900 dark:text-white">
                      {{ getRatingTier()?.label }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {{ getRatingTier()?.emoji }}
                    </p>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded">
                    {{ getRatingTier()?.description }}
                  </p>
                </div>
              </div>

              <!-- Performance Metrics Panel -->
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium mb-6">Performance Metrics</p>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <!-- Goals -->
                  <div class="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p class="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">GOALS</p>
                    <p class="text-3xl font-bold text-blue-900 dark:text-blue-100">{{ performance()!.score }}</p>
                  </div>

                  <!-- Assists -->
                  <div class="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p class="text-xs text-green-700 dark:text-green-300 font-medium mb-2">ASSISTS</p>
                    <p class="text-3xl font-bold text-green-900 dark:text-green-100">{{ performance()!.assists }}</p>
                  </div>

                  <!-- Distance -->
                  <div class="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p class="text-xs text-purple-700 dark:text-purple-300 font-medium mb-2">DISTANCE</p>
                    <p class="text-3xl font-bold text-purple-900 dark:text-purple-100">{{ performance()!.distanceCovered }}<span class="text-lg">km</span></p>
                  </div>

                  <!-- Time Played -->
                  <div class="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p class="text-xs text-orange-700 dark:text-orange-300 font-medium mb-2">PLAYED</p>
                    <p class="text-3xl font-bold text-orange-900 dark:text-orange-100">{{ performance()!.timePlayed }}<span class="text-lg">'</span></p>
                  </div>

                  <!-- Efficiency -->
                  <div class="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p class="text-xs text-red-700 dark:text-red-300 font-medium mb-2">EFFICIENCY</p>
                    <p class="text-3xl font-bold text-red-900 dark:text-red-100">{{ getEfficiency().toFixed(1) }}<span class="text-lg">/10</span></p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Calculated Insights -->
            <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Performance Insights</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p class="text-xs text-blue-700 dark:text-blue-300 font-medium">Goals Per Minute</p>
                  <p class="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {{ (performance()!.score / performance()!.timePlayed).toFixed(3) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-blue-700 dark:text-blue-300 font-medium">Assists Per Minute</p>
                  <p class="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {{ (performance()!.assists / performance()!.timePlayed).toFixed(3) }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-blue-700 dark:text-blue-300 font-medium">Distance Per Minute</p>
                  <p class="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {{ (performance()!.distanceCovered / performance()!.timePlayed).toFixed(2) }} km
                  </p>
                </div>
                <div>
                  <p class="text-xs text-blue-700 dark:text-blue-300 font-medium">Game Completion</p>
                  <p class="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {{ ((performance()!.timePlayed / 90) * 100).toFixed(0) }}%
                  </p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <a
                [routerLink]="['/app/admin/performances', performance()!.id, 'edit']"
                class="flex-1 text-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                ✏️ Edit Performance
              </a>
              <button
                (click)="openDeleteDialog()"
                class="flex-1 px-6 py-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors font-medium border border-red-200 dark:border-red-800"
              >
                🗑️ Delete Record
              </button>
            </div>
          </div>
        }

        @if (!isLoading() && error()) {
          <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            <strong>Error:</strong> {{ error() }}
          </div>
        }
      </div>

      <!-- Delete Confirmation Modal -->
      @if (showDeleteConfirm()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Performance Record?
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              This action cannot be undone. Are you sure you want to delete this performance record?
            </p>
            <div class="flex gap-3">
              <button
                (click)="showDeleteConfirm.set(false)"
                class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                (click)="confirmDelete()"
                [disabled]="isDeleting()"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
              >
                {{ isDeleting() ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PerformanceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private performanceService = inject(PerformanceService);

  performance = signal<PerformanceResponse | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  isDeleting = signal(false);
  showDeleteConfirm = signal(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadPerformance(params['id']);
      }
    });
  }

  private loadPerformance(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.performanceService.getPerformanceById(id).subscribe({
      next: (perf) => {
        this.performance.set(perf);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(this.performanceService.parseApiError(err.error || err));
        this.isLoading.set(false);
      }
    });
  }

  getRatingTier() {
    const perf = this.performance();
    if (!perf) return null;
    return getPerformanceRatingTier(perf.rating);
  }

  getRatingColor(): string {
    const tier = this.getRatingTier();
    return tier?.color || 'text-gray-500';
  }

  getEfficiency(): number {
    const perf = this.performance();
    if (!perf) return 0;
    const { score, assists, distanceCovered, timePlayed, rating } = perf;
    const goalEff = (score / 20) * 10;
    const assistEff = (assists / 15) * 10;
    const staminaEff = (distanceCovered / 50) * 10;
    const timeEff = (timePlayed / 120) * 10;
    return (goalEff * 0.25 + assistEff * 0.20 + staminaEff * 0.20 + timeEff * 0.15 + rating * 0.20) / 10;
  }

  openDeleteDialog(): void {
    this.showDeleteConfirm.set(true);
  }

  confirmDelete(): void {
    const perf = this.performance();
    if (!perf) return;

    this.isDeleting.set(true);
    this.performanceService.deletePerformance(perf.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.router.navigate(['/app/admin/performances']);
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.showDeleteConfirm.set(false);
        this.error.set(this.performanceService.parseApiError(err.error || err));
      }
    });
  }
}
