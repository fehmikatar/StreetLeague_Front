import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PerformanceRequest,
  PerformanceResponse,
  Performance,
  CareerStats,
  PerformanceFilter,
  PerformanceSortOption,
  calculateCareerStats,
  parsePerformanceApiError,
  validatePerformanceData,
  PlayerInfo
} from '../models/performance.model';

const API_BASE_URL = `${environment.apiUrl}/performances`;
const PLAYER_API_URL = `${environment.apiUrl}/players`;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private http = inject(HttpClient);

  // Signals for state management
  performances = signal<PerformanceResponse[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  filters = signal<PerformanceFilter>({});
  sortBy = signal<PerformanceSortOption>('date-desc');
  selectedPerformance = signal<PerformanceResponse | null>(null);

  // Computed filtered and sorted performances
  filteredPerformances = computed(() => {
    let result = [...this.performances()];

    const currentFilters = this.filters();

    if (currentFilters.minRating !== undefined) {
      result = result.filter(p => p.rating >= currentFilters.minRating!);
    }
    if (currentFilters.maxRating !== undefined) {
      result = result.filter(p => p.rating <= currentFilters.maxRating!);
    }
    if (currentFilters.minGoals !== undefined) {
      result = result.filter(p => p.score >= currentFilters.minGoals!);
    }
    if (currentFilters.maxGoals !== undefined) {
      result = result.filter(p => p.score <= currentFilters.maxGoals!);
    }
    if (currentFilters.minDistance !== undefined) {
      result = result.filter(p => p.distanceCovered >= currentFilters.minDistance!);
    }
    if (currentFilters.maxDistance !== undefined) {
      result = result.filter(p => p.distanceCovered <= currentFilters.maxDistance!);
    }

    // Apply sorting
    const sortOption = this.sortBy();
    switch (sortOption) {
      case 'rating-desc':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-asc':
        result.sort((a, b) => a.rating - b.rating);
        break;
      case 'goals-desc':
        result.sort((a, b) => b.score - a.score);
        break;
      case 'goals-asc':
        result.sort((a, b) => a.score - b.score);
        break;
      case 'assists-desc':
        result.sort((a, b) => b.assists - a.assists);
        break;
      case 'assists-asc':
        result.sort((a, b) => a.assists - b.assists);
        break;
      case 'distance-desc':
        result.sort((a, b) => b.distanceCovered - a.distanceCovered);
        break;
      case 'distance-asc':
        result.sort((a, b) => a.distanceCovered - b.distanceCovered);
        break;
      case 'date-asc':
        result.sort((a, b) => new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime());
        break;
      case 'date-desc':
      default:
        result.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        break;
    }

    return result;
  });

  constructor() {
    this.loadPerformancesFromCache();
  }

  /**
   * Get all performances (optionally filtered by player)
   */
  getPerformances(playerId?: number): Observable<PerformanceResponse[]> {
    this.isLoading.set(true);
    this.error.set(null);

    let url = API_BASE_URL;
    if (playerId) {
      url = `${url}?playerId=${playerId}`;
    }

    return this.http.get<PerformanceResponse[]>(url).pipe(
      tap(data => {
        this.performances.set(data);
        this.cachePerformances(data);
        this.isLoading.set(false);
      }),
      catchError(err => {
        const errorMsg = parsePerformanceApiError(err.error);
        this.error.set(errorMsg);
        this.isLoading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Alias for getPerformances() - returns all performances
   */
  getAll(): Observable<PerformanceResponse[]> {
    return this.getPerformances();
  }

  /**
   * Get single performance by ID
   */
  getPerformanceById(id: number): Observable<PerformanceResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.get<PerformanceResponse>(`${API_BASE_URL}/${id}`).pipe(
      tap(data => {
        this.selectedPerformance.set(data);
        this.isLoading.set(false);
      }),
      catchError(err => {
        const errorMsg = parsePerformanceApiError(err.error);
        this.error.set(errorMsg);
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  /**
   * Create new performance record
   */
  createPerformance(request: PerformanceRequest): Observable<PerformanceResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    // Validate before sending
    const validation = validatePerformanceData(request);
    if (!validation.valid) {
      const errorMsg = validation.errors.join('; ');
      this.error.set(errorMsg);
      this.isLoading.set(false);
      throw new Error(errorMsg);
    }

    return this.http.post<PerformanceResponse>(API_BASE_URL, request).pipe(
      tap(data => {
        const current = this.performances();
        this.performances.set([data, ...current]);
        this.invalidateCache();
        this.isLoading.set(false);
      }),
      catchError(err => {
        const errorMsg = parsePerformanceApiError(err.error);
        this.error.set(errorMsg);
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  /**
   * Update performance record
   */
  updatePerformance(id: number, request: PerformanceRequest): Observable<PerformanceResponse> {
    this.isLoading.set(true);
    this.error.set(null);

    const validation = validatePerformanceData(request);
    if (!validation.valid) {
      const errorMsg = validation.errors.join('; ');
      this.error.set(errorMsg);
      this.isLoading.set(false);
      throw new Error(errorMsg);
    }

    return this.http.put<PerformanceResponse>(`${API_BASE_URL}/${id}`, request).pipe(
      tap(data => {
        const current = this.performances();
        const index = current.findIndex(p => p.id === id);
        if (index > -1) {
          current[index] = data;
          this.performances.set([...current]);
        }
        this.selectedPerformance.set(data);
        this.invalidateCache();
        this.isLoading.set(false);
      }),
      catchError(err => {
        const errorMsg = parsePerformanceApiError(err.error);
        this.error.set(errorMsg);
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  /**
   * Delete performance record
   */
  deletePerformance(id: number): Observable<void> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.http.delete<void>(`${API_BASE_URL}/${id}`).pipe(
      tap(() => {
        const current = this.performances();
        this.performances.set(current.filter(p => p.id !== id));
        this.invalidateCache();
        this.isLoading.set(false);
      }),
      catchError(err => {
        const errorMsg = parsePerformanceApiError(err.error);
        this.error.set(errorMsg);
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  /**
   * Get player by ID (for enriching performance data)
   */
  getPlayer(playerId: number): Observable<PlayerInfo> {
    return this.http.get<PlayerInfo>(`${PLAYER_API_URL}/${playerId}`).pipe(
      catchError(err => {
        console.error('Error fetching player:', err);
        return of(null as any);
      })
    );
  }

  /**
   * Calculate career statistics for a player
   */
  getPlayerCareerStats(playerId: number): Observable<CareerStats> {
    return this.getPerformances(playerId).pipe(
      map(performances => calculateCareerStats(performances))
    );
  }

  /**
   * Get recent performances (last N)
   */
  getRecentPerformances(limit: number = 10): PerformanceResponse[] {
    return this.filteredPerformances().slice(0, limit);
  }

  /**
   * Get best performances (rating >= threshold)
   */
  getBestPerformances(minRating: number = 8.0): PerformanceResponse[] {
    return this.filteredPerformances().filter(p => p.rating >= minRating);
  }

  /**
   * Get performances for a specific match
   */
  getPerformancesByMatch(matchId: number): Observable<PerformanceResponse[]> {
    return this.http.get<PerformanceResponse[]>(`${API_BASE_URL}?matchId=${matchId}`).pipe(
      catchError(err => {
        console.error('Error fetching match performances:', err);
        return of([]);
      })
    );
  }

  /**
   * Set filter criteria
   */
  setFilters(filters: PerformanceFilter): void {
    this.filters.set(filters);
  }

  /**
   * Set sort option
   */
  setSortBy(sortOption: PerformanceSortOption): void {
    this.sortBy.set(sortOption);
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filters.set({});
    this.sortBy.set('date-desc');
  }

  /**
   * Get signals for public use
   */
  getPerformancesSignal() {
    return this.performances;
  }

  getIsLoadingSignal() {
    return this.isLoading;
  }

  getErrorSignal() {
    return this.error;
  }

  /**
   * Parse API errors for user display
   */
  parseApiError(error: any): string {
    return parsePerformanceApiError(error);
  }

  /**
   * Cache management
   */
  private cachePerformances(data: PerformanceResponse[]): void {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem('performances_cache', JSON.stringify(cacheData));
  }

  private loadPerformancesFromCache(): void {
    const cached = sessionStorage.getItem('performances_cache');
    if (cached) {
      try {
        const cacheData = JSON.parse(cached);
        if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
          this.performances.set(cacheData.data);
        } else {
          this.invalidateCache();
        }
      } catch (e) {
        this.invalidateCache();
      }
    }
  }

  private invalidateCache(): void {
    sessionStorage.removeItem('performances_cache');
  }
}