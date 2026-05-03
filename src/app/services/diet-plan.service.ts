import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DietPlanRequest {
  healthProfileId: number;
  planName: string;
  description?: string;
  dailyCalories?: number;
  mealSuggestions?: string;
  startDate: string;   // YYYY-MM-DD
  endDate?: string;
  isActive?: boolean;
  dietaryRestrictions?: string;
  nutritionalGoals?: string;
  createdBy: string;
}

export interface DietPlanResponse {
  id: number;
  healthProfileId: number;
  planName: string;
  description: string;
  dailyCalories: number;
  mealSuggestions: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  dietaryRestrictions: string;
  nutritionalGoals: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class DietPlanService {
  private apiUrl = 'http://localhost:8085/api/diet-plans';

  constructor(private http: HttpClient) {}

  getAll(): Observable<DietPlanResponse[]> {
    return this.http.get<DietPlanResponse[]>(this.apiUrl);
  }
  getById(id: number): Observable<DietPlanResponse> {
    return this.http.get<DietPlanResponse>(`${this.apiUrl}/${id}`);
  }
  getByHealthProfileId(healthProfileId: number): Observable<DietPlanResponse[]> {
    return this.http.get<DietPlanResponse[]>(`${this.apiUrl}/health-profile/${healthProfileId}`);
  }
  getActive(): Observable<DietPlanResponse[]> {
    return this.http.get<DietPlanResponse[]>(`${this.apiUrl}/active`);
  }
  getActiveByHealthProfile(healthProfileId: number): Observable<DietPlanResponse[]> {
    return this.http.get<DietPlanResponse[]>(`${this.apiUrl}/health-profile/${healthProfileId}/active`);
  }
  create(data: DietPlanRequest): Observable<DietPlanResponse> {
    return this.http.post<DietPlanResponse>(this.apiUrl, data);
  }
  update(id: number, data: DietPlanRequest): Observable<DietPlanResponse> {
    return this.http.put<DietPlanResponse>(`${this.apiUrl}/${id}`, data);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  activate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/activate`, {});
  }
  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/deactivate`, {});
  }
  searchFoodCalories(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search-calories?query=${query}`);
  }
  generateRecommendation(healthProfileId: number, goal?: string): Observable<DietPlanResponse> {
    let url = `${this.apiUrl}/health-profile/${healthProfileId}/recommend`;
    if (goal) {
      url += `?goal=${goal}`;
    }
    return this.http.post<DietPlanResponse>(url, {});
  }
}