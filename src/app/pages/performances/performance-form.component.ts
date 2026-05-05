import { Component, OnInit, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PerformanceService } from '../../services/performance.service';
import { PerformanceRequest, getPerformanceRatingTier, calculateEfficiency } from '../../models/performance.model';

/**
 * Performance Entry Form Component
 * Logs player performance after a match
 */
@Component({
  selector: 'app-performance-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div class="flex items-center gap-4">
            <a routerLink="/app/admin/performances" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ← Back
            </a>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ mode === 'create' ? 'Log Performance' : 'Edit Performance' }}
              </h1>
              <p class="mt-1 text-gray-600 dark:text-gray-400">
                {{ mode === 'create' ? 'Record player performance after match' : 'Update performance record' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        @if (isLoadingPerformance()) {
          <div class="space-y-4">
            <div class="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse"></div>
            <div class="h-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        }

        @if (!isLoadingPerformance() && form) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Performance Metrics Section -->
            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Performance Metrics</h2>

              <div class="space-y-6">
                <!-- Player & Match Selection -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Player ID -->
                  <div>
                    <label for="playerId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Player ID <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="playerId"
                      type="number"
                      formControlName="playerId"
                      placeholder="e.g., 5"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      [class.border-red-500]="isFieldInvalid('playerId')"
                    />
                    @if (isFieldInvalid('playerId')) {
                      <div class="text-red-500 text-xs mt-1">{{ getFieldError('playerId') }}</div>
                    }
                  </div>

                  <!-- Match ID -->
                  <div>
                    <label for="matchId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Match ID <span class="text-red-500">*</span>
                    </label>
                    <input
                      id="matchId"
                      type="number"
                      formControlName="matchId"
                      placeholder="e.g., 10"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      [class.border-red-500]="isFieldInvalid('matchId')"
                    />
                    @if (isFieldInvalid('matchId')) {
                      <div class="text-red-500 text-xs mt-1">{{ getFieldError('matchId') }}</div>
                    }
                  </div>
                </div>

                <!-- Score (Goals) -->
                <div>
                  <label for="score" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goals Scored <span class="text-red-500">*</span>
                  </label>
                  <div class="flex items-center gap-4">
                    <div class="flex-1">
                      <input
                        id="score"
                        type="range"
                        formControlName="score"
                        min="0"
                        max="20"
                        class="w-full"
                      />
                    </div>
                    <div class="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center font-mono">
                      {{ form.get('score')?.value || 0 }}
                    </div>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Range: 0-20 goals</p>
                  @if (isFieldInvalid('score')) {
                    <div class="text-red-500 text-xs mt-1">{{ getFieldError('score') }}</div>
                  }
                </div>

                <!-- Assists -->
                <div>
                  <label for="assists" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assists <span class="text-red-500">*</span>
                  </label>
                  <div class="flex items-center gap-4">
                    <div class="flex-1">
                      <input
                        id="assists"
                        type="range"
                        formControlName="assists"
                        min="0"
                        max="15"
                        class="w-full"
                      />
                    </div>
                    <div class="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center font-mono">
                      {{ form.get('assists')?.value || 0 }}
                    </div>
                  </div>
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Range: 0-15 assists</p>
                  @if (isFieldInvalid('assists')) {
                    <div class="text-red-500 text-xs mt-1">{{ getFieldError('assists') }}</div>
                  }
                </div>

                <!-- Distance Covered -->
                <div>
                  <label for="distanceCovered" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Distance Covered (km) <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="distanceCovered"
                    type="number"
                    step="0.1"
                    formControlName="distanceCovered"
                    placeholder="8-12 km typical"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    [class.border-red-500]="isFieldInvalid('distanceCovered')"
                  />
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Average player covers 8-12 km per match (max 50 km)</p>
                  @if (isFieldInvalid('distanceCovered')) {
                    <div class="text-red-500 text-xs mt-1">{{ getFieldError('distanceCovered') }}</div>
                  }
                </div>

                <!-- Time Played -->
                <div>
                  <label for="timePlayed" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Played (minutes) <span class="text-red-500">*</span>
                  </label>
                  <div class="flex gap-2 mb-3">
                    <button type="button" (click)="setTimePlayed(90)" [class.ring-2]="form.get('timePlayed')?.value === 90" class="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 ring-primary transition-colors">
                      90m (Full)
                    </button>
                    <button type="button" (click)="setTimePlayed(120)" [class.ring-2]="form.get('timePlayed')?.value === 120" class="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 ring-primary transition-colors">
                      120m (Extended)
                    </button>
                  </div>
                  <input
                    id="timePlayed"
                    type="number"
                    formControlName="timePlayed"
                    placeholder="0-120"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    [class.border-red-500]="isFieldInvalid('timePlayed')"
                  />
                  @if (isFieldInvalid('timePlayed')) {
                    <div class="text-red-500 text-xs mt-1">{{ getFieldError('timePlayed') }}</div>
                  }
                </div>

                <!-- Rating -->
                <div>
                  <label for="rating" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Performance Rating <span class="text-red-500">*</span>
                  </label>
                  <div class="space-y-3">
                    <div class="flex items-center gap-4">
                      <div class="flex-1">
                        <input
                          id="rating"
                          type="range"
                          formControlName="rating"
                          min="0"
                          max="10"
                          step="0.1"
                          class="w-full"
                        />
                      </div>
                      <div class="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center font-mono">
                        {{ (form.get('rating')?.value || 0) | number: '1.1-1' }}
                      </div>
                    </div>
                    @if (currentRatingTier()) {
                      <div [ngClass]="currentRatingTier()!.bgColor + ' p-3 rounded-lg'">
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">
                          {{ currentRatingTier()!.emoji }} {{ currentRatingTier()!.label }}
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {{ currentRatingTier()!.description }}
                        </p>
                      </div>
                    }
                  </div>
                  @if (isFieldInvalid('rating')) {
                    <div class="text-red-500 text-xs mt-1">{{ getFieldError('rating') }}</div>
                  }
                </div>
              </div>
            </div>

            <!-- Calculated Metrics (Display Only) -->
            @if (calculatedMetrics()) {
              <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-4">Calculated Metrics</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p class="text-xs text-blue-700 dark:text-blue-300">Goals/Min</p>
                    <p class="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">
                      {{ calculatedMetrics()!.goalsPerMinute.toFixed(2) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-700 dark:text-blue-300">Assists/Min</p>
                    <p class="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">
                      {{ calculatedMetrics()!.assistsPerMinute.toFixed(2) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-700 dark:text-blue-300">Distance/Min</p>
                    <p class="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">
                      {{ calculatedMetrics()!.kmPerMinute.toFixed(2) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-700 dark:text-blue-300">Efficiency</p>
                    <p class="text-lg font-mono font-bold text-blue-900 dark:text-blue-100">
                      {{ calculatedMetrics()!.efficiency.toFixed(1) }} / 10
                    </p>
                  </div>
                </div>
              </div>
            }

            <!-- Error Messages -->
            @if (submitError()) {
              <div class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-200">
                <strong>Error:</strong> {{ submitError() }}
              </div>
            }

            <!-- Submit Section -->
            <div class="flex gap-3">
              <button
                type="submit"
                [disabled]="!form.valid || isSubmitting()"
                class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {{ isSubmitting() ? (mode === 'create' ? 'Logging...' : 'Saving...') : (mode === 'create' ? '📊 Log Performance' : '💾 Save Changes') }}
              </button>
              <a
                routerLink="/app/admin/performances"
                class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-center"
              >
                Cancel
              </a>
            </div>
          </form>
        }
      </div>

      <!-- Success Toast -->
      @if (showSuccessMessage()) {
        <div class="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg animate-bounce">
          ✓ {{ mode === 'create' ? 'Performance logged successfully!' : 'Performance updated successfully!' }}
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-bounce {
      animation: bounce 2s infinite;
    }
  `]
})
export class PerformanceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private performanceService = inject(PerformanceService);

  form!: FormGroup;
  mode: 'create' | 'edit' = 'create';
  performanceId: number | null = null;
  isLoadingPerformance = signal(false);
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  showSuccessMessage = signal(false);

  currentRatingTier = computed(() => {
    const rating = this.form?.get('rating')?.value;
    return rating !== undefined ? getPerformanceRatingTier(rating) : null;
  });

  calculatedMetrics = computed(() => {
    if (!this.form) return null;

    const score = this.form.get('score')?.value || 0;
    const assists = this.form.get('assists')?.value || 0;
    const distanceCovered = this.form.get('distanceCovered')?.value || 0;
    const timePlayed = this.form.get('timePlayed')?.value || 1;
    const rating = this.form.get('rating')?.value || 0;

    return {
      goalsPerMinute: timePlayed > 0 ? score / timePlayed : 0,
      assistsPerMinute: timePlayed > 0 ? assists / timePlayed : 0,
      kmPerMinute: timePlayed > 0 ? distanceCovered / timePlayed : 0,
      efficiency: calculateEfficiency(score, assists, distanceCovered, timePlayed, rating)
    };
  });

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      playerId: [null, [Validators.required, Validators.min(1)]],
      matchId: [null, [Validators.required, Validators.min(1)]],
      score: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
      assists: [0, [Validators.required, Validators.min(0), Validators.max(15)]],
      distanceCovered: [0, [Validators.required, Validators.min(0), Validators.max(50)]],
      timePlayed: [90, [Validators.required, Validators.min(0), Validators.max(120)]],
      rating: [5, [Validators.required, Validators.min(0), Validators.max(10)]]
    });
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.mode = 'edit';
        this.performanceId = params['id'];
        this.loadPerformance();
      }
    });
  }

  private loadPerformance(): void {
    if (!this.performanceId) return;

    this.isLoadingPerformance.set(true);
    this.performanceService.getPerformanceById(this.performanceId).subscribe({
      next: (performance) => {
        this.form.patchValue({
          playerId: performance.playerId,
          matchId: performance.matchId,
          score: performance.score,
          assists: performance.assists,
          distanceCovered: performance.distanceCovered,
          timePlayed: performance.timePlayed,
          rating: performance.rating
        });
        this.isLoadingPerformance.set(false);
      },
      error: (err) => {
        this.submitError.set('Failed to load performance record');
        this.isLoadingPerformance.set(false);
      }
    });
  }

  setTimePlayed(minutes: number): void {
    this.form.get('timePlayed')?.setValue(minutes);
  }

  onSubmit(): void {
    if (!this.form || !this.form.valid) {
      this.submitError.set('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const request: PerformanceRequest = this.form.value;

    const operation = this.mode === 'create'
      ? this.performanceService.createPerformance(request)
      : this.performanceService.updatePerformance(this.performanceId!, request);

    operation.subscribe({
      next: (performance) => {
        this.isSubmitting.set(false);
        this.showSuccessMessage.set(true);

        setTimeout(() => {
          this.router.navigate(['/app/admin/performances', performance.id]);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.submitError.set(this.performanceService.parseApiError(err.error || err));
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form?.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.form?.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;

    return 'Invalid value';
  }
}
