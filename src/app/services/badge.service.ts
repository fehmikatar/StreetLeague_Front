import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, tap, catchError, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Badge,
  BadgeRequest,
  BadgeResponse,
  ApiErrorResponse,
  BadgeValidationError,
  BadgeCatalogFilters,
  BadgeStatistics
} from '../models/badge.model';

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/badges`;

  // Signals for state management
  private badges = signal<Badge[]>([]);
  private selectedBadge = signal<Badge | null>(null);
  private isLoading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private filters = signal<BadgeCatalogFilters>({
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Computed signal for filtered badges
  filteredBadges = computed(() => this.filterAndSortBadges());

  // Cache management
  private cacheExpiration = 5 * 60 * 1000; // 5 minutes
  private lastFetched = 0;

  constructor() {
    this.loadBadgesFromCache();
  }

  /**
   * Get all badges with caching
   */
  getBadges(): Observable<BadgeResponse[]> {
    const now = Date.now();
    if (this.badges().length > 0 && now - this.lastFetched < this.cacheExpiration) {
      return new Observable(obs => {
        obs.next(this.badges());
        obs.complete();
      });
    }

    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<BadgeResponse[]>(this.apiUrl).pipe(
      tap(badgesList => {
        this.badges.set(badgesList);
        this.lastFetched = now;
        this.saveBadgesToCache();
        this.isLoading.set(false);
      }),
      catchError(err => this.handleError(err, 'Failed to load badges'))
    );
  }

  /**
   * Get single badge by ID
   */
  getBadgeById(id: number): Observable<BadgeResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<BadgeResponse>(`${this.apiUrl}/${id}`).pipe(
      tap(badge => {
        this.selectedBadge.set(badge);
        this.isLoading.set(false);
      }),
      catchError(err => this.handleError(err, `Failed to load badge ${id}`))
    );
  }

  /**
   * Create new badge
   */
  createBadge(request: BadgeRequest): Observable<BadgeResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.post<BadgeResponse>(this.apiUrl, request).pipe(
      tap(newBadge => {
        this.badges.update(badges => [...badges, newBadge]);
        this.saveBadgesToCache();
        this.isLoading.set(false);
      }),
      catchError(err => this.handleError(err, 'Failed to create badge'))
    );
  }

  /**
   * Update existing badge
   */
  updateBadge(id: number, request: BadgeRequest): Observable<BadgeResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.put<BadgeResponse>(`${this.apiUrl}/${id}`, request).pipe(
      tap(updatedBadge => {
        this.badges.update(badges =>
          badges.map(b => b.id === id ? updatedBadge : b)
        );
        this.selectedBadge.set(updatedBadge);
        this.saveBadgesToCache();
        this.isLoading.set(false);
      }),
      catchError(err => this.handleError(err, 'Failed to update badge'))
    );
  }

  /**
   * Delete badge
   */
  deleteBadge(id: number): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.badges.update(badges => badges.filter(b => b.id !== id));
        if (this.selectedBadge()?.id === id) {
          this.selectedBadge.set(null);
        }
        this.saveBadgesToCache();
        this.isLoading.set(false);
      }),
      catchError(err => this.handleError(err, 'Failed to delete badge'))
    );
  }

  /**
   * Invalidate cache and reload badges
   */
  refreshBadges(): Observable<BadgeResponse[]> {
    this.lastFetched = 0;
    return this.getBadges();
  }

  /**
   * Update filter preferences
   */
  setFilters(filters: Partial<BadgeCatalogFilters>): void {
    this.filters.update(current => ({ ...current, ...filters }));
  }

  /**
   * Get current filters
   */
  getFilters(): BadgeCatalogFilters {
    return this.filters();
  }

  /**
   * Get current badges (signal)
   */
  getBadgesSignal(): Badge[] {
    return this.badges();
  }

  /**
   * Get selected badge (signal)
   */
  getSelectedBadge(): Badge | null {
    return this.selectedBadge();
  }

  /**
   * Get loading state (signal)
   */
  getIsLoading(): boolean {
    return this.isLoading();
  }

  /**
   * Get error state (signal)
   */
  getError(): string | null {
    return this.error();
  }

  /**
   * Validate badge form data
   * Returns validation errors if any
   */
  validateBadge(badge: BadgeRequest): BadgeValidationError[] {
    const errors: BadgeValidationError[] = [];

    // Name validation
    if (!badge.name || badge.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Le nom du badge est obligatoire' });
    } else if (badge.name.length > 100) {
      errors.push({ field: 'name', message: 'Le nom ne doit pas dépasser 100 caractères' });
    }

    // Description validation
    if (badge.description && badge.description.length > 255) {
      errors.push({ field: 'description', message: 'La description ne doit pas dépasser 255 caractères' });
    }

    // Level validation
    if (typeof badge.level !== 'number') {
      errors.push({ field: 'level', message: 'Le niveau est obligatoire' });
    } else if (badge.level < 0) {
      errors.push({ field: 'level', message: 'Le niveau doit être ≥ 0' });
    } else if (badge.level > 10) {
      errors.push({ field: 'level', message: 'Le niveau ne peut pas dépasser 10' });
    }

    // Required XP validation
    if (typeof badge.requiredXp !== 'number') {
      errors.push({ field: 'requiredXp', message: "L'XP requis est obligatoire" });
    } else if (badge.requiredXp < 0) {
      errors.push({ field: 'requiredXp', message: "L'XP requis doit être ≥ 0" });
    }

    // Icon URL validation
    if (!badge.iconUrl || badge.iconUrl.trim().length === 0) {
      errors.push({ field: 'iconUrl', message: "L'URL de l'icône est obligatoire" });
    } else if (!this.isValidUrl(badge.iconUrl)) {
      errors.push({ field: 'iconUrl', message: "L'URL de l'icône doit être valide" });
    }

    return errors;
  }

  /**
   * Parse error response from backend
   */
  parseApiError(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.error && typeof error.error === 'string') {
      return error.error;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }

  /**
   * Private helper methods
   */
  private filterAndSortBadges(): Badge[] {
    let filtered = [...this.badges()];
    const { searchQuery, minLevel, maxLevel, sortBy, sortOrder } = this.filters();

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(badge =>
        badge.name.toLowerCase().includes(query) ||
        (badge.description?.toLowerCase().includes(query) ?? false)
      );
    }

    // Level range filter
    if (minLevel !== undefined) {
      filtered = filtered.filter(b => b.level >= minLevel);
    }
    if (maxLevel !== undefined) {
      filtered = filtered.filter(b => b.level <= maxLevel);
    }

    // Sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (sortBy) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'level':
          compareValue = a.level - b.level;
          break;
        case 'xp':
          compareValue = a.requiredXp - b.requiredXp;
          break;
        case 'createdAt':
          compareValue = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          break;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }

  private handleError(err: HttpErrorResponse, message: string): Observable<never> {
    const errorMessage = this.parseApiError(err);
    this.error.set(`${message}: ${errorMessage}`);
    this.isLoading.set(false);
    return throwError(() => new Error(errorMessage));
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private saveBadgesToCache(): void {
    try {
      sessionStorage.setItem('badges_cache', JSON.stringify(this.badges()));
      sessionStorage.setItem('badges_cache_time', String(Date.now()));
    } catch (e) {
      console.warn('Failed to save badges to cache:', e);
    }
  }

  private loadBadgesFromCache(): void {
    try {
      const cached = sessionStorage.getItem('badges_cache');
      const cacheTime = sessionStorage.getItem('badges_cache_time');

      if (cached && cacheTime) {
        const now = Date.now();
        const age = now - parseInt(cacheTime, 10);

        if (age < this.cacheExpiration) {
          this.badges.set(JSON.parse(cached));
          this.lastFetched = parseInt(cacheTime, 10);
        }
      }
    } catch (e) {
      console.warn('Failed to load badges from cache:', e);
    }
  }
}
