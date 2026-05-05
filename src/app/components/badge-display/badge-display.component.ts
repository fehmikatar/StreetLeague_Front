import { Component, input, signal, computed } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { BadgeResponse, getBadgeLevelTier } from '../../models/badge.model';

export type BadgeDisplayStyle = 'default' | 'compact' | 'detailed' | 'inline';

/**
 * Reusable Badge Display Component
 * Shows badge information with flexible styling options
 * Supports tooltip on hover showing description and XP requirement
 */
@Component({
  selector: 'app-badge-display',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div [class]="getContainerClasses()" role="img" [attr.aria-label]="badge().name">
      <!-- Badge Icon/Image -->
      <div class="relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        <img
          [ngSrc]="badge().iconUrl"
          [alt]="badge().name"
          width="64"
          height="64"
          class="h-full w-full object-cover transition-transform duration-300"
          [class.scale-110]="isHovered()"
          (error)="onImageError()"
        />
        @if (imageError()) {
          <div class="flex items-center justify-center h-full w-full bg-gray-200 dark:bg-gray-700">
            <span class="text-2xl">🎖️</span>
          </div>
        }
      </div>

      <!-- Badge Info -->
      @if (style() !== 'inline') {
        <div class="flex-1">
          <!-- Name -->
          <div class="font-semibold text-sm md:text-base truncate" [title]="badge().name">
            {{ badge().name }}
          </div>

          <!-- Level Indicator -->
          <div class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {{ getLevelTierLabel() }}
          </div>

          <!-- Description (for detailed style) -->
          @if (style() === 'detailed' && badge().description) {
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {{ badge().description }}
            </p>
          }

          <!-- XP Info (for detailed style) -->
          @if (style() === 'detailed') {
            <div class="text-xs text-gray-600 dark:text-gray-400 mt-2">
              XP Required: <span class="font-mono text-primary">{{ badge().requiredXp | number }}</span>
            </div>
          }
        </div>
      }

      <!-- Level Indicator (Compact) -->
      @if (style() === 'compact') {
        <div class="absolute top-1 right-1 flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs font-bold">
          {{ badge().level }}
        </div>
      }

      <!-- Tooltip -->
      @if (isHovered() && style() !== 'inline') {
        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none tooltip">
          <div class="font-semibold">{{ badge().name }}</div>
          @if (badge().description) {
            <div class="text-gray-200 dark:text-gray-700">{{ badge().description }}</div>
          }
          <div class="text-yellow-300 dark:text-yellow-600 text-xs">{{ badge().requiredXp | number }} XP required</div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      @apply inline-block;
    }

    .tooltip {
      animation: fadeInUp 200ms ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translate(-50%, 8px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
  `],
  host: {
    '(mouseenter)': 'isHovered.set(true)',
    '(mouseleave)': 'isHovered.set(false)'
  }
})
export class BadgeDisplayComponent {
  badge = input.required<BadgeResponse>();
  style = input<BadgeDisplayStyle>('default');
  size = input<'sm' | 'md' | 'lg'>('md');

  isHovered = signal<boolean>(false);
  imageError = signal<boolean>(false);

  levelTier = computed(() => getBadgeLevelTier(this.badge().level));

  getContainerClasses(): string {
    let classes = 'relative cursor-pointer group flex items-start gap-2 transition-all duration-200';

    // Size classes for default and compact styles
    if (this.style() === 'inline') {
      classes += ' inline-flex gap-1';
    } else if (this.style() === 'detailed') {
      classes += ' flex-col p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:shadow-lg';
    } else if (this.style() === 'compact') {
      classes += ' relative';
    }

    // Size-based image dimensions
    const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
      sm: 'w-10 h-10 min-w-10',
      md: 'w-16 h-16 min-w-16',
      lg: 'w-24 h-24 min-w-24'
    };
    classes += ` ${sizeClasses[this.size()]}`;

    return classes;
  }

  getLevelTierLabel(): string {
    if (this.style() === 'inline') return '';
    return `★ Level ${this.badge().level}/10 • ${this.levelTier().label}`;
  }

  onImageError(): void {
    this.imageError.set(true);
  }
}
