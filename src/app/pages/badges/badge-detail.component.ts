import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { BadgeService } from '../../services/badge.service';
import { BadgeResponse, getBadgeLevelTier } from '../../models/badge.model';

/**
 * Badge Detail Page
 * Displays full badge information with edit/delete options
 */
@Component({
  selector: 'app-badge-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Back Button -->
      <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <a routerLink="/admin/badges" class="text-primary hover:underline text-sm font-medium">
            ← Back to Catalog
          </a>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div class="space-y-4">
            <div class="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse"></div>
            <div class="h-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200">
            <strong>Error:</strong> {{ error() }}
            <button (click)="loadBadge()" class="ml-2 underline font-semibold">
              Retry
            </button>
          </div>
        </div>
      }

      <!-- Main Content -->
      @if (badge() && !isLoading() && !error()) {
        <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <!-- Header Section -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden mb-6">
            <div class="h-32 bg-gradient-to-r from-primary/20 to-primary/5"></div>

            <div class="px-6 py-6">
              <div class="flex flex-col md:flex-row gap-8">
                <!-- Badge Icon -->
                <div class="flex-shrink-0">
                  <div class="w-32 h-32 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                    <img
                      [src]="badge()!.iconUrl"
                      [alt]="badge()!.name"
                      class="w-full h-full object-contain p-2"
                      (error)="onImageError($event)"
                    />
                  </div>
                </div>

                <!-- Badge Information -->
                <div class="flex-1">
                  <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ badge()!.name }}</h1>

                  <!-- Level Badge -->
                  <div class="mt-2 inline-flex items-center gap-2">
                    <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                      Level {{ badge()!.level }}/10
                    </span>
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                      {{ getLevelTierLabel() }}
                    </span>
                  </div>

                  <!-- Description -->
                  @if (badge()!.description) {
                    <p class="mt-4 text-gray-600 dark:text-gray-300">
                      {{ badge()!.description }}
                    </p>
                  }

                  <!-- Key Metrics -->
                  <div class="mt-6 grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">XP Required</div>
                      <div class="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                        {{ badge()!.requiredXp | number }}
                      </div>
                    </div>
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div class="text-xs text-gray-600 dark:text-gray-400 font-medium">Badge ID</div>
                      <div class="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                        #{{ badge()!.id }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <!-- Badge Attributes -->
            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Badge Attributes</h2>
              <div class="space-y-4">
                <div>
                  <div class="text-xs font-medium text-gray-600 dark:text-gray-400">Level Tier</div>
                  <div class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ getLevelTier().label }}
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {{ getLevelTier().description }}
                  </p>
                </div>

                <div>
                  <div class="text-xs font-medium text-gray-600 dark:text-gray-400">Level Range</div>
                  <div class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ getLevelTier().min }} - {{ getLevelTier().max }}
                  </div>
                </div>

                <div>
                  <div class="text-xs font-medium text-gray-600 dark:text-gray-400">Color Theme</div>
                  <div class="mt-1 flex items-center gap-2">
                    <div class="w-4 h-4 rounded" [class]="'bg-' + (getLevelTier().color.split('-')[1])"></div>
                    <span class="text-sm text-gray-900 dark:text-white">{{ getLevelTier().color }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- XP Information -->
            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">XP Requirements</h2>
              <div class="space-y-4">
                <div>
                  <div class="text-xs font-medium text-gray-600 dark:text-gray-400">XP to Earn</div>
                  <div class="mt-1 text-2xl font-bold text-primary">
                    {{ badge()!.requiredXp | number }}
                  </div>
                </div>

                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">Suggested XP Values</div>
                  <div class="flex flex-wrap gap-2">
                    <span class="px-2 py-1 bg-white dark:bg-gray-900 rounded text-xs text-gray-700 dark:text-gray-300">
                      100 XP
                    </span>
                    <span class="px-2 py-1 bg-white dark:bg-gray-900 rounded text-xs text-gray-700 dark:text-gray-300">
                      500 XP
                    </span>
                    <span class="px-2 py-1 bg-white dark:bg-gray-900 rounded text-xs text-gray-700 dark:text-gray-300">
                      1000 XP
                    </span>
                    <span class="px-2 py-1 bg-white dark:bg-gray-900 rounded text-xs text-gray-700 dark:text-gray-300">
                      5000 XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Icon Information -->
          <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Icon Information</h2>
            <div class="space-y-2">
              <div>
                <div class="text-xs font-medium text-gray-600 dark:text-gray-400">Icon URL</div>
                <div class="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-x-auto">
                  <code class="text-xs text-gray-900 dark:text-white font-mono">{{ badge()!.iconUrl }}</code>
                </div>
              </div>
              <button
                (click)="copyIconUrl()"
                class="text-xs text-primary hover:underline"
              >
                Copy URL
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <a
              [routerLink]="['/admin/badges', badge()!.id, 'edit']"
              class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              ✏️ Edit Badge
            </a>
            <button
              (click)="openDeleteConfirmation()"
              class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              🗑️ Delete Badge
            </button>
          </div>

          <!-- Delete Confirmation Modal -->
          @if (showDeleteConfirmation()) {
            <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div class="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm mx-4">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Badge?
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete "{{ badge()!.name }}"? This action cannot be undone.
                </p>
                <div class="flex gap-3">
                  <button
                    (click)="confirmDelete()"
                    [disabled]="isDeleting()"
                    class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {{ isDeleting() ? 'Deleting...' : 'Delete' }}
                  </button>
                  <button
                    (click)="closeDeleteConfirmation()"
                    [disabled]="isDeleting()"
                    class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class BadgeDetailComponent implements OnInit {
  badgeService = inject(BadgeService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  badge = signal<BadgeResponse | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  isDeleting = signal<boolean>(false);
  showDeleteConfirmation = signal<boolean>(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadBadge(Number(id));
      }
    });
  }

  loadBadge(id?: number): void {
    const badgeId = id || this.route.snapshot.params['id'];
    this.isLoading.set(true);
    this.error.set(null);

    this.badgeService.getBadgeById(Number(badgeId)).subscribe({
      next: (badge) => {
        this.badge.set(badge);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(this.badgeService.parseApiError(err));
      }
    });
  }

  getLevelTier() {
    return getBadgeLevelTier(this.badge()?.level || 0);
  }

  getLevelTierLabel(): string {
    const tier = this.getLevelTier();
    return `${tier.label} (${tier.min}-${tier.max})`;
  }

  openDeleteConfirmation(): void {
    this.showDeleteConfirmation.set(true);
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation.set(false);
  }

  confirmDelete(): void {
    if (!this.badge()) return;

    this.isDeleting.set(true);
    this.badgeService.deleteBadge(this.badge()!.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteConfirmation.set(false);
        // Redirect to catalog after successful deletion
        this.router.navigate(['/admin/badges']);
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.error.set(this.badgeService.parseApiError(err));
      }
    });
  }

  copyIconUrl(): void {
    if (!this.badge()) return;
    navigator.clipboard.writeText(this.badge()!.iconUrl);
  }

  onImageError(event: any): void {
    event.target.textContent = '🎖️';
  }
}
