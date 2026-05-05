// health-ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AthletePredictionRequest {
  duration: number;
  intensity: number;
  trainingLoad: number;
  sleepHours: number;
  sleepQuality: number;
  fatigueLevel: number;
  hydrationLiters: number;
  bmi: number;
  weightKg: number;
  caloriesIn: number;
  nutritionAdherence: number;
  sorenessCode: number;
}

export interface ChatResponse {
  reply: string;
  healthScore?: number;
  assessment?: string;
  prediction?: string;
}

export interface HealthScoreHistory {
  id: number;
  healthScore: number;
  assessment: string;
  prediction: string;
  measuredAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class HealthAiService {
  private healthApiUrl = 'http://localhost:8085/api/health-profiles';

  constructor(private http: HttpClient) { }

  predictHealthScore(data: AthletePredictionRequest): Observable<number> {
    return this.http.post<number>(`${this.healthApiUrl}/predict`, data);
  }

  sendChatMessage(message: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.healthApiUrl}/chat`, { message });
  }

  saveHealthScore(userId: number, score: number, assessment: string, prediction: string): Observable<void> {
    return this.http.post<void>(`${this.healthApiUrl}/user/${userId}/save-score`, { score, assessment, prediction });
  }

  getHistory(userId: number): Observable<HealthScoreHistory[]> {
    return this.http.get<HealthScoreHistory[]>(`${this.healthApiUrl}/user/${userId}/history`);
  }
}