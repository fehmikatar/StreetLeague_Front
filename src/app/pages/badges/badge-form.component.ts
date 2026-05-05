import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { BadgeService } from '../../services/badge.service';
import { BadgeRequest, BadgeResponse, getBadgeLevelTier } from '../../models/badge.model';

/**
 * Badge Form Component (Create/Edit)
 * Handles both creating new badges and editing existing ones
 * Includes real-time validation and image preview
 */
@Component({
  selector: 'app-badge-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div class="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div class="flex items-center gap-4">
            <a routerLink="/app/admin/badges" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ← Back
            </a>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ mode === 'create' ? 'Create New Badge' : 'Edit Badge' }}
              </h1>
              <p class="mt-1 text-gray-600 dark:text-gray-400">
                {{ mode === 'create' ? 'Add a new achievement badge to your platform' : 'Update badge information' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <!-- Loading State (for edit) -->
        @if (isLoadingBadge()) {
          <div class="space-y-4">
            <div class="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse"></div>
            <div class="h-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        }

        <!-- Form -->
        @if (!isLoadingBadge() && form) {
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- General Info Section -->
            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Information</h2>

              <div class="space-y-6">
                <!-- Name Field -->
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Badge Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    formControlName="name"
                    placeholder="e.g., Gold Winner, Team Captain"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    [class.border-red-500]="isFieldInvalid('name')"
                  />
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                      {{ form.get('name')?.value?.length || 0 }} / 100 characters
                    </span>
                    @if (!isFieldInvalid('name') && form.get('name')?.value) {
                      <span class="text-green-600 dark:text-green-400 text-xs">✓ Valid</span>
                    }
                  </div>
                  @if (isFieldInvalid('name')) {
                    <div class="text-red-500 text-xs mt-1">
                      {{ getFieldError('name') }}
                    </div>
                  }
                </div>

                <!-- Description Field -->
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    formControlName="description"
                    placeholder="Describe what this badge represents..."
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  ></textarea>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-600 dark:text-gray-400">
                      {{ form.get('description')?.value?.length || 0 }} / 255 characters
                    </span>
                    @if (!isFieldInvalid('description') && form.get('description')?.value) {
                      <span class="text-green-600 dark:text-green-400 text-xs">✓ Valid</span>
                    }
                  </div>
                  @if (isFieldInvalid('description')) {
                    <div class="text-red-500 text-xs mt-1">
                      {{ getFieldError('description') }}
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Badge Properties Section -->
            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Badge Properties</h2>

              <div class="space-y-6">
                <!-- Level Field -->
                <div>
                  <label for="level" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Badge Level <span class="text-red-500">*</span>
                  </label>
                  <div class="flex gap-4">
                    <div class="flex-1">
                      <input
                        id="level"
                        type="range"
                        formControlName="level"
                        min="0"
                        max="10"
                        class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>0</span>
                        <span>5</span>
                        <span>10</span>
                      </div>
                    </div>
                    <div class="flex-shrink-0">
                      <div class="w-16 px-3 py-2 bg-primary/10 text-primary rounded-lg text-center font-bold text-lg">
                        {{ form.get('level')?.value || 0 }}
                      </div>
                    </div>
                  </div>
                  <div class="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p class="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {{ getLevelTierLabel() }}
                    </p>
                    <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {{ getLevelTierDescription() }}
                    </p>
                  </div>
                  @if (isFieldInvalid('level')) {
                    <div class="text-red-500 text-xs mt-2">
                      {{ getFieldError('level') }}
                    </div>
                  }
                </div>

                <!-- Required XP Field -->
                <div>
                  <label for="requiredXp" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Required Experience (XP) <span class="text-red-500">*</span>
                  </label>
                  <div class="flex gap-2 mb-3">
                    <input
                      id="requiredXp"
                      type="number"
                      formControlName="requiredXp"
                      min="0"
                      placeholder="e.g., 1000"
                      class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                      [class.border-red-500]="isFieldInvalid('requiredXp')"
                    />
                  </div>

                  <!-- Suggested Values -->
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span class="text-xs text-gray-600 dark:text-gray-400">Suggested:</span>
                    @for (value of suggestedXpValues; track value) {
                      <button
                        type="button"
                        (click)="setXpValue(value)"
                        class="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {{ value | number }}
                      </button>
                    }
                  </div>

                  @if (!isFieldInvalid('requiredXp') && form.get('requiredXp')?.value) {
                    <span class="text-green-600 dark:text-green-400 text-xs">✓ Valid ({{ form.get('requiredXp')?.value | number }} XP)</span>
                  }
                  @if (isFieldInvalid('requiredXp')) {
                    <div class="text-red-500 text-xs">
                      {{ getFieldError('requiredXp') }}
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Icon Section -->
            <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-6">Badge Icon</h2>

              <div class="space-y-6">
                <!-- Icon URL Field -->
                <div>
                  <label for="iconUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon URL <span class="text-red-500">*</span>
                  </label>
                  <input
                    id="iconUrl"
                    type="text"
                    formControlName="iconUrl"
                    placeholder="https://example.com/badge-icon.png"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                    (change)="onIconUrlChange()"
                    [class.border-red-500]="isFieldInvalid('iconUrl')"
                  />
                  <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Recommended: PNG or SVG format, minimum 64x64px
                  </p>
                  @if (!isFieldInvalid('iconUrl') && form.get('iconUrl')?.value) {
                    <span class="text-green-600 dark:text-green-400 text-xs">✓ Valid URL</span>
                  }
                  @if (isFieldInvalid('iconUrl')) {
                    <div class="text-red-500 text-xs mt-2">
                      {{ getFieldError('iconUrl') }}
                    </div>
                  }
                </div>

                <!-- Icon Preview -->
                @if (iconPreviewUrl()) {
                  <div class="border border-gray-200 dark:border-gray-800 rounded-lg p-6 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <div class="text-center">
                      <img
                        [src]="iconPreviewUrl()"
                        alt="Icon Preview"
                        class="w-32 h-32 object-contain mx-auto"
                        (error)="onPreviewError()"
                      />
                      <p class="text-xs text-gray-600 dark:text-gray-400 mt-2">Icon Preview</p>
                    </div>
                  </div>
                }

                @if (previewError()) {
                  <div class="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 text-sm">
                    Failed to load icon preview. Please verify the URL is correct and the image is publicly accessible.
                  </div>
                }
              </div>
            </div>

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
                {{ isSubmitting() ? (mode === 'create' ? 'Creating...' : 'Saving...') : (mode === 'create' ? '✨ Create Badge' : '💾 Save Changes') }}
              </button>
              <a
                routerLink="/app/admin/badges"
                class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium text-center"
              >
                Cancel
              </a>
            </div>
          </form>
        }
      </div>

      <!-- Success Toast (Optional) -->
      @if (showSuccessMessage()) {
        <div class="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg animate-fade-in">
          ✓ {{ mode === 'create' ? 'Badge created successfully!' : 'Badge updated successfully!' }}
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host ::ng-deep .animate-fade-in {
      animation: fadeIn 300ms ease-out;
    }
  `]
})
export class BadgeFormComponent implements OnInit {
  badgeService = inject(BadgeService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);

  form: FormGroup | null = null;
  mode: 'create' | 'edit' = 'create';
  badgeId: number | null = null;

  isLoadingBadge = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  submitError = signal<string | null>(null);
  showSuccessMessage = signal<boolean>(false);
  iconPreviewUrl = signal<string | null>(null);
  previewError = signal<boolean>(false);

  suggestedXpValues = [100, 500, 1000, 5000, 10000];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.mode = 'edit';
        this.badgeId = Number(id);
        this.loadBadgeForEdit(Number(id));
      } else {
        this.mode = 'create';
        this.initializeForm();
      }
    });
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(255)]],
      level: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
      requiredXp: [0, [Validators.required, Validators.min(0)]],
      iconUrl: ['', [Validators.required]]
    });
  }

  private loadBadgeForEdit(id: number): void {
    this.isLoadingBadge.set(true);

    this.badgeService.getBadgeById(id).subscribe({
      next: (badge) => {
        this.initializeForm();
        this.form?.patchValue({
          name: badge.name,
          description: badge.description || '',
          level: badge.level,
          requiredXp: badge.requiredXp,
          iconUrl: badge.iconUrl
        });
        this.iconPreviewUrl.set(badge.iconUrl);
        this.isLoadingBadge.set(false);
      },
      error: (err) => {
        this.isLoadingBadge.set(false);
        this.submitError.set(this.badgeService.parseApiError(err));
      }
    });
  }

  onSubmit(): void {
    if (!this.form || !this.form.valid) {
      this.submitError.set('Please fill in all required fields correctly');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const badgeRequest: BadgeRequest = this.form.value;

    const operation = this.mode === 'create'
      ? this.badgeService.createBadge(badgeRequest)
      : this.badgeService.updateBadge(this.badgeId!, badgeRequest);

    operation.subscribe({
      next: (badge) => {
        this.isSubmitting.set(false);
        this.showSuccessMessage.set(true);

        setTimeout(() => {
          this.router.navigate(['/app/admin/badges', badge.id]);
        }, 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.submitError.set(this.badgeService.parseApiError(err));
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
    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;

    return 'Invalid value';
  }

  getLevelTierLabel(): string {
    const level = this.form?.get('level')?.value || 0;
    const tier = getBadgeLevelTier(level);
    return `${tier.label} (Level ${tier.min}-${tier.max})`;
  }

  getLevelTierDescription(): string {
    const level = this.form?.get('level')?.value || 0;
    const tier = getBadgeLevelTier(level);
    return tier.description;
  }

  setXpValue(value: number): void {
    this.form?.patchValue({ requiredXp: value });
  }

  onIconUrlChange(): void {
    const url = this.form?.get('iconUrl')?.value;
    if (url && this.isValidUrl(url)) {
      this.iconPreviewUrl.set(url);
      this.previewError.set(false);
    } else {
      this.iconPreviewUrl.set(null);
    }
  }

  onPreviewError(): void {
    this.previewError.set(true);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
