import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { calculateBadgeProgress, getProgressColor, BadgeResponse } from '../../models/badge.model';

/**
 * Badge Progress Widget
 * Displays player progress toward earning a specific badge
 * Shows XP progress bar with color coding
 */
@Component({
  selector: 'app-badge-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-sm">{{ badge().name }}</h3>
        <span class="text-xs font-mono text-gray-600 dark:text-gray-400">
          {{ currentXp() }} / {{ badge().requiredXp }} XP
        </span>
      </div>

      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          [class]="progressColorClass()"
          [style.width.%]="progressPercentage()"
        ></div>
      </div>

      <!-- Progress Text -->
      <div class="text-xs text-gray-600 dark:text-gray-400">
        {{ progressPercentage() }}% Progress
        @if (isComplete()) {
          <span class="ml-1 text-green-600 dark:text-green-400 font-semibold">✓ Earned!</span>
        }
      </div>

      <!-- Badge Details -->
      @if (showDetails()) {
        <div class="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <strong>Level:</strong> {{ badge().level }}/10
          </div>
          @if (badge().description) {
            <div class="mt-1">
              <strong>Description:</strong> {{ badge().description }}
            </div>
          }
        </div>
      }
    </div>
  `,
  host: {
    'class': 'block p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800'
  }
})
export class BadgeProgressComponent {
  badge = input.required<BadgeResponse>();
  currentXp = input<number>(0);
  showDetails = input<boolean>(false);

  progressPercentage = computed(() => {
    return calculateBadgeProgress(this.currentXp(), this.badge().requiredXp);
  });

  isComplete = computed(() => {
    return this.currentXp() >= this.badge().requiredXp;
  });

  progressColorClass = computed(() => {
    const percentage = this.progressPercentage();
    const colorClass = getProgressColor(percentage);
    return colorClass;
  });
}
