import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface HealthProfileResponse {
  id: number;
  userId: number;
  weight: number;
  height: number;
  age: number;
  sportPosition: string;
  fitnessStatus: string;
  lastUpdated: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  bmi: number;
  bmiCategory: string;
  gender?: string;               // MALE / FEMALE
  bmr?: number;
  maintenanceCalories?: number;
  weightLossCalories?: number;
  weightGainCalories?: number;
  healthScore?: number;
  healthScoreMessage?: string;
  personalizedAdvice?: string;
}

export interface ActivityRecommendation {
  dayOfWeek: string;
  activityName: string;
  durationMinutes: number;
  intensity: string;
  description: string;
}

export interface HealthProfileRequest {
  userId: number;
  weight: number;
  height: number;
  age: number;
  sportPosition: string;
  fitnessStatus: string;
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  gender?: string;
}

@Injectable({ providedIn: 'root' })
export class HealthProfileService {
  private apiUrl = 'http://localhost:8085/api/health-profiles';

  constructor(private http: HttpClient) { }

  getAll(): Observable<HealthProfileResponse[]> {
    return this.http.get<HealthProfileResponse[]>(this.apiUrl);
  }

  getById(id: number): Observable<HealthProfileResponse> {
    return this.http.get<HealthProfileResponse>(`${this.apiUrl}/${id}`);
  }

  getByUserId(userId: number): Observable<HealthProfileResponse> {
    return this.http.get<HealthProfileResponse>(`${this.apiUrl}/user/${userId}`);
  }

  getActivityPlan(userId: number): Observable<ActivityRecommendation[]> {
    return this.http.get<ActivityRecommendation[]>(`${this.apiUrl}/user/${userId}/activities`);
  }



  create(data: HealthProfileRequest): Observable<HealthProfileResponse> {
    return this.http.post<HealthProfileResponse>(this.apiUrl, data);
  }

  update(id: number, data: HealthProfileRequest): Observable<HealthProfileResponse> {
    return this.http.put<HealthProfileResponse>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getActivityPlanByWeek(userId: number, week: number): Observable<ActivityRecommendation[]> {
    return this.http.get<ActivityRecommendation[]>(`${this.apiUrl}/user/${userId}/activities/${week}`);
  }
}